import { omit } from 'lodash';
import React, { useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import * as zod from 'zod';
import DownloadWrapper from '../charts/DownloadWrapper';
import TypeDistributionChart from '../charts/TypeDistributionChart';
import { fillFromPrimitiveMap, possibleAgeKeys } from '../helpers/fill-missing';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { getNewSamples } from '../services/api';
import { Widget } from './Widget';

interface Props {
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
}

const VariantAgeDistributionPlot = ({ variantSampleSet, wholeSampleSet }: Props) => {
  const { width, ref } = useResizeDetector();
  const widthIsSmall = !!width && width < 700;

  const processedData = useMemo(() => {
    const filledData = fillFromPrimitiveMap(
      variantSampleSet.proportionByField('ageGroup', wholeSampleSet),
      possibleAgeKeys,
      { count: 0, proportion: 0 }
    );
    return filledData
      .filter(({ key }) => key !== null)
      .map(({ key, value: { count, proportion } }) => ({
        name: widthIsSmall ? key!.replace(/-\d+$/, '-') : key!,
        quantity: count,
        percent: proportion === undefined ? undefined : 100 * proportion,
      }));
  }, [variantSampleSet, wholeSampleSet, widthIsSmall]);

  return (
    <div ref={ref as React.MutableRefObject<HTMLDivElement>} style={{ height: '100%' }}>
      <DownloadWrapper name='VariantAgeDistributionPlot'>
        <TypeDistributionChart data={processedData} onClickHandler={_ => true} />
      </DownloadWrapper>
    </div>
  );
};

export const VariantAgeDistributionPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      variantSampleSelector: NewSampleSelectorSchema,
      wholeSampleSelector: NewSampleSelectorSchema,
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
  VariantAgeDistributionPlot,
  'VariantAgeDistributionPlot'
);
