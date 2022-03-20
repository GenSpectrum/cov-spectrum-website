import {
  HospitalizationDeathChartInner,
  GroupValue,
  SubgroupTexts,
  SubgroupValue,
  TopLevelTexts,
  ValueWithConfidence,
  PerTrueFalse,
} from './HospitalizationDeathChartInner';
import { capitalize } from 'lodash';
import { calculateWilsonInterval } from '../helpers/wilson-interval';
import { useResizeDetector } from 'react-resize-detector';
import React, { useMemo } from 'react';
import { fillFromPrimitiveMap, possibleAgeKeys } from '../helpers/fill-missing';
import assert from 'assert';
import { approximateBinomialRatioConfidence } from '../helpers/binomial-ratio-confidence';
import DownloadWrapper from './DownloadWrapper';
import { Utils } from '../services/Utils';
import { AgeCountSampleData } from '../data/sample/AgeCountSampleDataset';
import { HospDiedAgeSampleDataset } from '../data/sample/HospDiedAgeSampleDataset';
import { getDisplayDateRange } from '../data/DateRange';
import { useExploreUrl } from '../helpers/explore-url';

export type HospitalizationDeathChartProps = {
  variantSampleSet: HospDiedAgeSampleDataset;
  wholeSampleSet: HospDiedAgeSampleDataset;
  field: 'hospitalized' | 'died';
  variantName: string;
  extendedMetrics?: boolean;
  relativeToOtherVariants?: boolean;
};

const makeHospitalizedTexts = (variant: string): SubgroupTexts => ({
  legend: capitalize(variant),
  true: {
    title: 'Hospitalized',
    helpText: `Number of samples taken from patients who were eventually hospitalized (${variant})`,
  },
  false: {
    title: 'Not hosp.',
    helpText: `Number of samples taken from patients who were not eventually hospitalized (${variant})`,
  },
});

const makeDeceasedTexts = (variant: string): SubgroupTexts => ({
  legend: capitalize(variant),
  true: {
    title: 'Dead',
    helpText: `Number of samples taken from patients who eventually died (${variant})`,
  },
  false: {
    title: 'Not dead',
    helpText: `Number of samples taken from patients who did not eventually die (${variant})`,
  },
});

const makeTexts = (
  variantName: string,
  relativeToOtherVariants: boolean,
  displayDateString?: string
): { hospitalized: TopLevelTexts; died: TopLevelTexts } => ({
  hospitalized: {
    title:
      'Estimated probability of hospitalization by age group' +
      (relativeToOtherVariants ? ', relative to other variants' : '') +
      (displayDateString ? ' ' + displayDateString : ''),
    subject: makeHospitalizedTexts(variantName),
    reference: makeHospitalizedTexts('other variants'),
  },
  died: {
    title:
      'Estimated probability of death by age group' +
      (relativeToOtherVariants ? ', relative to other variants' : '') +
      (displayDateString ? ' ' + displayDateString : ''),
    subject: makeDeceasedTexts(variantName),
    reference: makeDeceasedTexts('other variants'),
  },
});

function processCounts(count: PerTrueFalse<number>): SubgroupValue {
  if (count.true + count.false === 0) {
    return { count };
  }

  return {
    count,
    proportion: {
      value: count.true / (count.true + count.false),
      confidenceInterval: calculateWilsonInterval(count.true, count.true + count.false),
    },
  };
}

const noopOnClickHandler = () => {};

export const HospitalizationDeathChart = ({
  variantSampleSet,
  wholeSampleSet,
  field,
  variantName,
  extendedMetrics,
  relativeToOtherVariants = false,
}: HospitalizationDeathChartProps) => {
  const { width, height, ref } = useResizeDetector();
  const widthIsSmall = !!width && width < 700;

  const processedData = useMemo((): GroupValue[] => {
    const filterAndGroupByAge = (
      originalSampleSet: HospDiedAgeSampleDataset
    ): {
      ageGroup: string | null;
      counts: PerTrueFalse<number>;
    }[] => {
      const groupedByAgeGroup = Utils.groupBy(originalSampleSet.payload, e =>
        e.age !== null ? AgeCountSampleData.fromAgeToAgeGroup(e.age) : null
      );
      const filled = fillFromPrimitiveMap(groupedByAgeGroup, possibleAgeKeys, []);
      return filled.map(({ key: ageGroup, value: samples }) => {
        const counts = samples.reduce(
          (prev, curr) => {
            if (curr[field]) {
              return { true: prev.true + curr.count, false: prev.false };
            } else if (curr[field] === false) {
              return { true: prev.true, false: prev.false + curr.count };
            } else {
              return prev;
            }
          },
          { true: 0, false: 0 }
        );
        return { ageGroup, counts };
      });
    };

    const variantFilledData = filterAndGroupByAge(variantSampleSet);
    const wholeFilledData = filterAndGroupByAge(wholeSampleSet);

    return variantFilledData.map(({ ageGroup, counts: variantCounts }, i) => {
      const wholeEntry = wholeFilledData[i];
      assert(!!wholeEntry && wholeEntry.ageGroup === ageGroup);
      const wholeCounts = wholeEntry.counts;
      const referenceCounts = {
        true: wholeCounts.true - variantCounts.true,
        false: wholeCounts.false - variantCounts.false,
      };

      const label = widthIsSmall
        ? ageGroup
          ? ageGroup.replace(/-\d+$/, '-')
          : '?'
        : ageGroup
        ? ageGroup
        : 'Unk.';

      const baseCounts = {
        subject: processCounts(variantCounts),
        reference: processCounts(referenceCounts),
      };

      if (relativeToOtherVariants) {
        const x = baseCounts.subject.count.true;
        const m = baseCounts.subject.count.true + baseCounts.subject.count.false;
        const y = baseCounts.reference.count.true;
        const n = baseCounts.reference.count.true + baseCounts.reference.count.false;

        let relativeProportion: ValueWithConfidence | undefined = {
          value: x / m / (y / n),
          confidenceInterval: approximateBinomialRatioConfidence(x, m, y, n),
        };
        if (
          !isFinite(relativeProportion.value) ||
          !relativeProportion.confidenceInterval.every(v => isFinite(v))
        ) {
          relativeProportion = undefined;
        }

        return {
          label,
          subject: {
            count: baseCounts.subject.count,
            proportion: relativeProportion,
          },
          reference: { count: baseCounts.reference.count },
        };
      }

      return {
        ...baseCounts,
        label,
      };
    });
  }, [variantSampleSet, wholeSampleSet, field, widthIsSmall, relativeToOtherVariants]);

  const total = useMemo(() => {
    const total = { subject: { count: { true: 0, false: 0 } }, reference: { count: { true: 0, false: 0 } } };
    for (const entry of processedData) {
      for (const [_k0, v0] of Object.entries(total)) {
        const k0 = _k0 as 'subject' | 'reference';
        for (const _k1 of Object.keys(v0.count)) {
          const k1 = _k1 as 'true' | 'false';
          v0.count[k1] += entry[k0].count[k1];
        }
      }
    }
    return total;
  }, [processedData]);

  const csvData = useMemo(
    () =>
      processedData.map(entry => ({
        age_class: entry.label,
        subject_mean: entry.subject.proportion?.value,
        subject_uncertainty_min: entry.subject.proportion?.confidenceInterval[0],
        subject_uncertainty_max: entry.subject.proportion?.confidenceInterval[1],
        reference_mean: entry.reference.proportion?.value,
        reference_uncertainty_min: entry.reference.proportion?.confidenceInterval[0],
        reference_uncertainty_max: entry.reference.proportion?.confidenceInterval[1],
      })),
    [processedData]
  );

  const exploreUrl = useExploreUrl();
  const displayDateString = getDisplayDateRange(exploreUrl?.dateRange.getDateRange());

  const texts = makeTexts(variantName, relativeToOtherVariants, displayDateString)[field];

  return (
    <DownloadWrapper name='HospitalizationDeathPlot' csvData={csvData}>
      <div ref={ref as React.MutableRefObject<HTMLDivElement>} className='h-full'>
        {width && height && (
          <>
            <HospitalizationDeathChartInner
              data={processedData}
              total={total}
              texts={texts}
              extendedMetrics={extendedMetrics}
              onClickHandler={noopOnClickHandler}
              maxY={
                relativeToOtherVariants
                  ? Math.max(
                      ...processedData
                        .filter(v => v.subject.proportion)
                        .map(v => v.subject.proportion!.value * 2)
                    ) || 5
                  : undefined
              }
              hideReferenceScatter={relativeToOtherVariants}
            />
          </>
        )}
      </div>
    </DownloadWrapper>
  );
};
