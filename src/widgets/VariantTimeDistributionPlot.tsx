import { omit } from 'lodash';
import React from 'react';
import * as zod from 'zod';
import DownloadWrapper from '../charts/DownloadWrapper';
import TimeChart from '../charts/TimeChart';
import { fillFromWeeklyMap } from '../helpers/fill-missing';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { getNewSamples } from '../services/api';
import { Widget } from './Widget';

interface Props {
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
}

export const VariantTimeDistributionPlot = ({ variantSampleSet, wholeSampleSet }: Props) => {
  const processedData = fillFromWeeklyMap(variantSampleSet.proportionByWeek(wholeSampleSet), {
    count: 0,
    proportion: 0,
  }).map(({ key, value: { count, proportion } }) => ({
    firstDayInWeek: key.firstDay.string,
    yearWeek: key.yearWeekString,
    percent: proportion === undefined ? undefined : 100 * proportion,
    quantity: count,
  }));

  return (
    <DownloadWrapper name='VariantTimeDistributionPlot'>
      <TimeChart data={processedData} onClickHandler={(_) => true} />
    </DownloadWrapper>
  );
};

export const VariantTimeDistributionPlotWidget = new Widget(
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
  VariantTimeDistributionPlot,
  'VariantTimeDistributionPlot'
);
