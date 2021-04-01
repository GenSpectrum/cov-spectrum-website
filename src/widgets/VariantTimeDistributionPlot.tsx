import { omit } from 'lodash';
import React from 'react';
import * as zod from 'zod';
import TimeChart from '../charts/TimeChart';
import { fillWeeklyApiDataNew } from '../helpers/fill-missing';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { getNewSamples } from '../services/api';
import { NewWidget } from './Widget';

interface Props {
  sampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
}

export const VariantTimeDistributionPlot = ({ sampleSet, wholeSampleSet }: Props) => {
  const dataBeforeFill = sampleSet.proportionByWeek(wholeSampleSet).map(({ isoWeek, count, proportion }) => ({
    isoWeek,
    quantity: count,
    percent: proportion === undefined ? undefined : 100 * proportion,
  }));
  const processedData = fillWeeklyApiDataNew(dataBeforeFill, { percent: 0, quantity: 0 }).map(
    ({ isoWeek, percent, quantity }) => ({
      firstDayInWeek: isoWeek.firstDay.string,
      yearWeek: isoWeek.yearWeekString,
      percent,
      quantity,
    })
  );

  return <TimeChart data={processedData} onClickHandler={(e: unknown) => true} />;
};

export const VariantTimeDistributionPlotWidget = new NewWidget(
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
  VariantTimeDistributionPlot,
  'VariantTimeDistributionPlot'
);
