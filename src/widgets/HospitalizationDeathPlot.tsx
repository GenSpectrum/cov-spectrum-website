import assert from 'assert';
import dayjs from 'dayjs';
import { capitalize, omit } from 'lodash';
import React, { useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import * as zod from 'zod';
import { TitleWrapper } from '../charts/common';
import DownloadWrapper from '../charts/DownloadWrapper';
import {
  GroupedProportionComparisonChart,
  GroupValue,
  SubgroupTexts,
  SubgroupValue,
  TopLevelTexts,
  ValueWithConfidence,
} from '../charts/GroupedProportionComparisonChart';
import { approximateBinomialRatioConfidence } from '../helpers/binomial-ratio-confidence';
import { globalDateCache } from '../helpers/date-cache';
import { fillFromPrimitiveMap, possibleAgeKeys } from '../helpers/fill-missing';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { ParsedMultiSample, SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import { calculateWilsonInterval } from '../helpers/wilson-interval';
import { getNewSamples } from '../services/api';
import { Widget } from './Widget';

export const OMIT_LAST_N_WEEKS = 4;

interface Props {
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
  field: 'hospitalized' | 'deceased';
  variantName: string;
  extendedMetrics?: boolean;
  relativeToOtherVariants?: boolean;
}

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
  relativeToOtherVariants: boolean
): { hospitalized: TopLevelTexts; deceased: TopLevelTexts } => ({
  hospitalized: {
    title:
      'Estimated probability of hospitalization by age group' +
      (relativeToOtherVariants ? ', relative to other variants' : ''),
    subject: makeHospitalizedTexts(variantName),
    reference: makeHospitalizedTexts('other variants'),
  },
  deceased: {
    title:
      'Estimated probability of death by age group' +
      (relativeToOtherVariants ? ', relative to other variants' : ''),
    subject: makeDeceasedTexts(variantName),
    reference: makeDeceasedTexts('other variants'),
  },
});

function processCounts(
  positiveSamples: ParsedMultiSample[],
  negativeSamples: ParsedMultiSample[],
  field: 'hospitalized' | 'deceased'
): SubgroupValue {
  let count = { true: 0, false: 0 };
  for (const [k, v] of new SampleSet(positiveSamples, null).countByField(field)) {
    if (k === true) {
      count.true += v;
    } else if (k === false) {
      count.false += v;
    }
  }
  for (const [k, v] of new SampleSet(negativeSamples, null).countByField(field)) {
    if (k === true) {
      count.true -= v;
    } else if (k === false) {
      count.false -= v;
    }
  }

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

export const HospitalizationDeathPlot = ({
  variantSampleSet,
  wholeSampleSet,
  field,
  variantName,
  extendedMetrics,
  relativeToOtherVariants = false,
}: Props) => {
  const { width, height, ref } = useResizeDetector();
  const widthIsSmall = !!width && width < 700;

  const processedData = useMemo((): GroupValue[] => {
    const filterAndGroupData = (originalSampleSet: SampleSet) => {
      const lastWeek = globalDateCache.getDayUsingDayjs(
        globalDateCache.getDayUsingDayjs(dayjs()).dayjs.subtract(OMIT_LAST_N_WEEKS, 'weeks')
      ).isoWeek;
      const filteredSampleSet = new SampleSet(
        [...originalSampleSet.getAll()].filter(s => !globalDateCache.weekIsBefore(lastWeek, s.date.isoWeek)),
        null
      );
      return fillFromPrimitiveMap(filteredSampleSet.groupByField('ageGroup'), possibleAgeKeys, []);
    };

    const variantFilledData = filterAndGroupData(variantSampleSet);
    const wholeFilledData = filterAndGroupData(wholeSampleSet);

    return variantFilledData.map(({ key, value: variantSamples }, i) => {
      const wholeEntry = wholeFilledData[i];
      assert(!!wholeEntry && wholeEntry.key === key);
      const wholeSamples = wholeEntry.value;

      const label = widthIsSmall ? (key ? key.replace(/-\d+$/, '-') : '?') : key ? key : 'Unk.';

      const baseCounts = {
        subject: processCounts(variantSamples, [], field),
        reference: processCounts(wholeSamples, variantSamples, field),
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

  const texts = makeTexts(variantName, relativeToOtherVariants)[field];

  return (
    <DownloadWrapper name='HospitalizationDeathPlot' csvData={csvData}>
      <div ref={ref as React.MutableRefObject<HTMLDivElement>} style={{ height: '300px' }}>
        {width && height && (
          <>
            <TitleWrapper>{texts.title}</TitleWrapper>
            <GroupedProportionComparisonChart
              data={processedData}
              total={total}
              texts={texts}
              width={width}
              height={height}
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

export const HospitalizationDeathPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      variantSampleSelector: NewSampleSelectorSchema,
      wholeSampleSelector: NewSampleSelectorSchema,
      field: zod.union([zod.literal('hospitalized'), zod.literal('deceased')]),
      variantName: zod.string(),
      extendedMetrics: zod.boolean().optional(),
      relativeToOtherVariants: zod.boolean().optional(),
    }),
    async (decoded: Props) => ({
      ...omit(decoded, ['variantSampleSet', 'wholeSampleSet']),
      variantSampleSelector: decoded.variantSampleSet.sampleSelector,
      wholeSampleSelector: decoded.wholeSampleSet.sampleSelector,
    }),
    async (encoded, signal) => ({
      ...omit(encoded, ['variantSampleSelector', 'wholeSampleSelector']),
      variantSampleSet: await getNewSamples(encoded.variantSampleSelector, signal),
      wholeSampleSet: await getNewSamples(encoded.wholeSampleSelector, signal),
    })
  ),
  HospitalizationDeathPlot,
  'HospitalizationDeathPlot'
);
