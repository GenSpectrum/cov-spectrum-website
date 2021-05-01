import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { getSequencingIntensity } from '../services/api';
import { SequencingIntensityEntry, Country, CountrySchema } from '../services/api-types';
import { Widget } from './Widget';
import * as zod from 'zod';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import TimeIntensityChart, { TimeIntensityEntry } from '../charts/TimeIntensityChart';
import Loader from '../components/Loader';
import DownloadWrapper from '../charts/DownloadWrapper';

interface Props {
  country: Country;
}

const groupByMonth = (entries: SequencingIntensityEntry[]): TimeIntensityEntry[] => {
  const groupedEntries = _(
    entries.map(d => ({
      firstDayInWeek: d.x,
      yearWeek: d.x.split('-')[0] + '-' + d.x.split('-')[1],
      proportion: d.y.numberSequenced,
      quantity: d.y.numberCases,
    }))
  )
    .groupBy('yearWeek')
    .map((monthData, id) => ({
      id: id,
      month: monthData[0].yearWeek,
      proportion: _.sumBy(monthData, 'proportion'),
      quantity: _.sumBy(monthData, 'quantity'),
    }))
    .value();
  if (groupedEntries[groupedEntries.length - 1].quantity == 0) {
    groupedEntries.pop();
  }
  return groupedEntries;
};

const processData = (data: SequencingIntensityEntry[]): any => groupByMonth(data);

export const SequencingIntensityPlot = ({ country }: Props) => {
  const [data, setData] = useState<SequencingIntensityEntry[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    setIsLoading(true);
    if (country) {
      getSequencingIntensity({ country, signal }).then(newSequencingData => {
        if (isSubscribed) {
          setData(newSequencingData);
        }
        setIsLoading(false);
      });
    }

    return () => {
      isSubscribed = false;
      controller.abort();
      setIsLoading(false);
    };
  }, [country]);

  return data === undefined || isLoading ? (
    <Loader />
  ) : (
    <DownloadWrapper name='SequencingIntensityPlot'>
      <TimeIntensityChart data={processData(data)} onClickHandler={(e: unknown) => true} />
    </DownloadWrapper>
  );
};

export const SequencingIntensityPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      country: CountrySchema,
    }),
    async (decoded: Props) => decoded,
    async encoded => encoded
  ),
  SequencingIntensityPlot,
  'SequencingIntensityPlot'
);
