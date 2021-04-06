import { omit } from 'lodash';
import React, { useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import * as zod from 'zod';
import TypeDistributionChart from '../charts/TypeDistributionChart';
import { fillFromPrimitiveMap, possibleAgeKeys } from '../helpers/fill-missing';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { getNewSamples } from '../services/api';
import { Widget } from './Widget';

interface Props {
  sampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
}

const VariantAgeDistributionPlot = ({ sampleSet, wholeSampleSet }: Props) => {
  const { width, ref } = useResizeDetector();
  const widthIsSmall = !!width && width < 700;

  const processedData = useMemo(() => {
    const filledData = fillFromPrimitiveMap(
      sampleSet.proportionByField('ageGroup', wholeSampleSet),
      possibleAgeKeys,
      { count: 0, proportion: 0 }
    );
    return filledData
      .filter(({ key }) => key !== null)
      .map(({ key, count, proportion }) => ({
        name: widthIsSmall ? key!.replace(/-\d+$/, '-') : key!,
        quantity: count,
        percent: proportion === undefined ? undefined : 100 * proportion,
      }));
  }, [sampleSet, wholeSampleSet, widthIsSmall]);

  return (
    <div ref={ref as React.MutableRefObject<HTMLDivElement>} style={{ height: '100%' }}>
      <TypeDistributionChart data={processedData} onClickHandler={(e: unknown) => true} />
    </div>
  );
};

export const VariantAgeDistributionPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      sampleSelector: NewSampleSelectorSchema,
      wholeSampleSelector: NewSampleSelectorSchema,
    }),
    async (decoded: Props) => ({
      ...omit(decoded, ['sampleSet', 'wholeSampleSet']),
      sampleSelector: decoded.sampleSet.sampleSelector,
      wholeSampleSelector: decoded.wholeSampleSet.sampleSelector,
    }),
    async (encoded, signal) => ({
      ...omit(encoded, ['sampleSelector', 'wholeSampleSelector']),
      sampleSet: await getNewSamples(encoded.sampleSelector, signal),
      wholeSampleSet: await getNewSamples(encoded.wholeSampleSelector, signal),
    })
  ),
  VariantAgeDistributionPlot,
  'VariantAgeDistributionPlot'
);
