import assert from 'assert';
import React, { useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import calculateWilsonInterval from 'wilson-interval';
import {
  GroupedProportionComparisonChart,
  GroupValue,
  SubgroupValue,
} from '../charts/GroupedProportionComparisonChart';
import { fillFromPrimitiveMap, possibleAgeKeys } from '../helpers/fill-missing';
import { ParsedMultiSample, SampleSet, SampleSetWithSelector } from '../helpers/sample-set';

interface Props {
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
  field: 'hospitalized' | 'deceased';
}

function processCounts(
  positiveSamples: ParsedMultiSample[],
  negativeSamples: ParsedMultiSample[],
  field: 'hospitalized' | 'deceased'
): SubgroupValue {
  let countTrue = 0;
  let countFalse = 0;
  for (const [k, v] of new SampleSet(positiveSamples, null).countByField(field)) {
    if (k === true) {
      countTrue += v;
    } else if (k === false) {
      countFalse += v;
    }
  }
  for (const [k, v] of new SampleSet(negativeSamples, null).countByField(field)) {
    if (k === true) {
      countTrue -= v;
    } else if (k === false) {
      countFalse -= v;
    }
  }

  if (countTrue + countFalse === 0) {
    return { countTrue, countFalse };
  }

  const wilsonInterval = calculateWilsonInterval(countTrue, countTrue + countFalse, false, {
    confidence: 0.95,
    precision: 10,
  });
  return {
    countTrue,
    countFalse,
    proportion: {
      value: countTrue / (countTrue + countFalse),
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
    const total = { subject: { countTrue: 0, countFalse: 0 }, reference: { countTrue: 0, countFalse: 0 } };
    for (const entry of processedData) {
      for (const [_k0, v0] of Object.entries(total)) {
        const k0 = _k0 as 'subject' | 'reference';
        for (const _k1 of Object.keys(v0)) {
          const k1 = _k1 as 'countTrue' | 'countFalse';
          v0[k1] += entry[k0][k1];
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
          texts={{
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
          }}
          width={width}
          height={height}
          onClickHandler={noopOnClickHandler}
        />
      )}
    </div>
  );
};
