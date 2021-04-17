import assert from 'assert';
import React, { useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import calculateWilsonInterval from 'wilson-interval';
import {
  GroupedProportionComparisonChart,
  GroupValue,
  SubgroupValue,
  TopLevelTexts,
} from '../charts/GroupedProportionComparisonChart';
import { fillFromPrimitiveMap, possibleAgeKeys } from '../helpers/fill-missing';
import { ParsedMultiSample, SampleSet, SampleSetWithSelector } from '../helpers/sample-set';

interface Props {
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
  field: 'hospitalized' | 'deceased';
}

const texts: { hospitalized: TopLevelTexts; deceased: TopLevelTexts } = {
  hospitalized: {
    subject: {
      true: {
        title: 'Hospitalized',
        helpText: 'Number of samples taken from patients who were eventually hospitalized',
      },
      false: {
        title: 'Not hosp.',
        helpText: 'Number of samples taken from patients who were not eventually hospitalized',
      },
    },
  },
  deceased: {
    subject: {
      true: {
        title: 'Dead',
        helpText: 'Number of samples taken from patients who eventually died',
      },
      false: {
        title: 'Not dead',
        helpText: 'Number of samples taken from patients who did not eventually die',
      },
    },
  },
};

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

  const wilsonInterval = calculateWilsonInterval(count.true, count.true + count.false, false, {
    confidence: 0.95,
    precision: 10,
  });
  return {
    count,
    proportion: {
      value: count.true / (count.true + count.false),
      confidenceInterval: [+wilsonInterval.low, +wilsonInterval.high],
    },
  };
}

const noopOnClickHandler = () => {};

export const HospitalizationDeathPlot = ({ variantSampleSet, wholeSampleSet, field }: Props) => {
  const { width, height, ref } = useResizeDetector();
  const widthIsSmall = !!width && width < 700;

  const processedData = useMemo((): GroupValue[] => {
    const fillData = (sampleSet: SampleSet) =>
      fillFromPrimitiveMap(sampleSet.groupByField('ageGroup'), possibleAgeKeys, []);
    const variantFilledData = fillData(variantSampleSet);
    const wholeFilledData = fillData(wholeSampleSet);

    return variantFilledData.map(({ key, value: variantSamples }, i) => {
      const wholeEntry = wholeFilledData[i];
      assert(!!wholeEntry && wholeEntry.key === key);
      const wholeSamples = wholeEntry.value;

      return {
        label: widthIsSmall ? (key ? key.replace(/-\d+$/, '-') : '?') : key ? key : 'Unk.',
        subject: processCounts(variantSamples, [], field),
        reference: processCounts(wholeSamples, variantSamples, field),
      };
    });
  }, [variantSampleSet, wholeSampleSet, field, widthIsSmall]);

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

  return (
    <div ref={ref as React.MutableRefObject<HTMLDivElement>} style={{ height: '300px' }}>
      {width && height && (
        <GroupedProportionComparisonChart
          data={processedData}
          total={total}
          texts={texts[field]}
          width={width}
          height={height}
          onClickHandler={noopOnClickHandler}
        />
      )}
    </div>
  );
};
