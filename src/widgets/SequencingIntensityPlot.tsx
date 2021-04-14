import React, { useState, useEffect } from 'react';
import { omit } from 'lodash';
import { getSequencingIntensity } from '../services/api';
import { SequencingIntensityEntry, Country, CountrySchema } from '../services/api-types';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { Widget } from './Widget';
import * as zod from 'zod';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import TimeIntensityChart from '../charts/TimeIntensityChart';
import Loader from '../components/Loader';

// const PropsSchema = NewSampleSelectorSchema;
// type Props = zod.infer<typeof PropsSchema>;

interface Props {
  country: Country;
}

const processData = (data: SequencingIntensityEntry[]): any =>
  data.map(d => ({
    firstDayInWeek: d.x,
    yearWeek: d.x,
    proportion: d.y.numberSequenced,
    quantity: d.y.numberCases,
  }));

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
    <TimeIntensityChart data={processData(data)} onClickHandler={(e: unknown) => true} />
  );
};


export const SequencingIntensityPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      country: CountrySchema,
    }),
    async (decoded: Props) => ({
      ...omit(decoded, ['country']),
      country: decoded.country,
    }),
    async (encoded) => ({
      country: encoded.country,
    })
  ),
  SequencingIntensityPlot,
  'SequencingIntensityPlot'
);