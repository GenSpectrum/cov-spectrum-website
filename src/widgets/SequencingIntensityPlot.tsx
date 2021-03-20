import React, { useState, useEffect } from 'react';
import { DistributionType, getSequencingIntensity } from '../services/api';
import { SequencingIntensityEntry } from '../services/api-types';
import { CountrySelectorSchema } from '../helpers/sample-selector';
import { Widget } from './Widget';
import * as zod from 'zod';
import { ZodQueryEncoder } from '../helpers/query-encoder';
// import { fillWeeklyApiData } from '../helpers/fill-missing';
// import { EntryWithoutCI, removeCIFromEntry } from '../helpers/confidence-interval';
import TimeIntensityChart, { TimeIntensityEntry } from '../charts/TimeIntensityChart';
import Loader from '../components/Loader';

const PropsSchema = CountrySelectorSchema;
type Props = zod.infer<typeof PropsSchema>;

const processData = (data: SequencingIntensityEntry[]): any =>
  data.map(d => ({
    firstDayInWeek: d.x.firstDayInWeek,
    yearWeek: d.x.yearWeek,
    proportion: d.y.numberSequenced,
    quantity: d.y.numberCases,
  }));;

export const SequencingIntensityPlot = ({ country }: Props) => {
  const [data, setData] = useState<SequencingIntensityEntry[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    setIsLoading(true);
    getSequencingIntensity({ country, signal }).then(newSequencingData => {
      if (isSubscribed) {
        console.log(newSequencingData);
        setData(newSequencingData);
      }
      setIsLoading(false);
    });

    return () => {
      isSubscribed = false;
      controller.abort();
      setIsLoading(false);
    };
  }, [country]);

    return data === undefined || isLoading ? (
      <Loader />
    ) : (
      <TimeIntensityChart data={processData(data)} onClickHandler={(e: unknown) => true} />
    );
};

export const SequencingIntensityPlotWidget = new Widget(
  new ZodQueryEncoder(PropsSchema),
  SequencingIntensityPlot,
  'SequencingIntensityPlot'
);
