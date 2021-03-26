import dayjs from 'dayjs';
import { groupBy, mergeWith, omit, zipWith } from 'lodash';
import React from 'react';
import * as zod from 'zod';
import TimeChart, { TimeEntry } from '../charts/TimeChart';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { dayjsToYearWeekString, dayjsToYearWeekWithDay } from '../helpers/week';
import { getNewSamples } from '../services/api';
import { NewWidget } from './Widget';

interface Props {
  sampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
}

export const VariantTimeDistributionPlot = ({ sampleSet, wholeSampleSet }: Props) => {
  const groupedSampleSet = groupBy([...sampleSet.getAll()], s => dayjsToYearWeekString(dayjs(s.date)));
  const groupedWholeSampleSet = groupBy([...wholeSampleSet.getAll()], s =>
    dayjsToYearWeekString(dayjs(s.date))
  );
  const processedData: TimeEntry[] = Object.entries(groupedSampleSet).map(([k, g]) => {
    const { firstDayInWeek, yearWeek } = dayjsToYearWeekWithDay(dayjs(g[0].date));
    return {
      firstDayInWeek,
      yearWeek,
      percent: (100 * g.length) / groupedWholeSampleSet[k].length,
      quantity: g.length,
    };
  });

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
