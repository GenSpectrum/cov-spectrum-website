import assert from 'assert';
import React, { useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';
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

  return {
    countTrue,
    countFalse,
    proportion:
      countTrue + countFalse === 0
        ? undefined
        : {
            value: countTrue / (countTrue + countFalse),
            confidenceInterval: [0, 1],
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
        left: processCounts(variantSamples, [], field),
        right: processCounts(wholeSamples, variantSamples, field),
      };
    });
  }, [variantSampleSet, wholeSampleSet, field, widthIsSmall]);

  return (
    <div ref={ref as React.MutableRefObject<HTMLDivElement>} style={{ height: '300px' }}>
      {width && height && (
        <GroupedProportionComparisonChart
          data={processedData}
          width={width}
          height={height}
          onClickHandler={noopOnClickHandler}
        />
      )}
    </div>
  );
};
