import React, { useState, useEffect } from 'react';
import { DistributionType, getVariantDistributionData } from '../services/api';
import { TimeDistributionEntry } from '../services/api-types';
import { SampleSelectorSchema } from '../helpers/sample-selector';
import { Widget } from './Widget';
import * as zod from 'zod';
import { ZodQueryEncoder } from '../helpers/query-encoder';

import { fillWeeklyApiData } from '../helpers/fill-missing';
import { EntryWithoutCI, removeCIFromEntry } from '../helpers/confidence-interval';
import TimeChart, { TimeEntry } from '../charts/TimeChart';
import Loader from '../components/Loader';

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema>;

export const VariantTimeDistributionPlot = ({
  country,
  mutations,
  matchPercentage,
  samplingStrategy,
}: Props) => {
  const [distribution, setDistribution] = useState<EntryWithoutCI<TimeDistributionEntry>[] | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    setIsLoading(true);
    getVariantDistributionData(
      {
        distributionType: DistributionType.Time,
        country,
        mutations,
        matchPercentage,
        samplingStrategy,
      },
      signal
    ).then(newDistributionData => {
      if (isSubscribed) {
        setDistribution(
          fillWeeklyApiData(newDistributionData.map(removeCIFromEntry), { count: 0, proportion: 0 })
        );
      }
      setIsLoading(false);
    });

    return () => {
      isSubscribed = false;
      controller.abort();
      setIsLoading(false);
    };
  }, [country, mutations, matchPercentage, samplingStrategy]);

  const processedData: TimeEntry[] | undefined = distribution?.map(d => ({
    firstDayInWeek: d.x.firstDayInWeek,
    yearWeek: d.x.yearWeek,
    percent: d.y.proportion * 100,
    quantity: d.y.count,
  }));

  return (<p>Chart goes here</p>)

//   return processedData === undefined || isLoading ? (
//     <Loader />
//   ) : (
//     <TimeChart data={processedData} onClickHandler={(e: unknown) => true} />
//   );
};

export const VariantTimeDistributionPlotWidget = new Widget(
  new ZodQueryEncoder(PropsSchema),
  VariantTimeDistributionPlot,
  'VariantTimeDistributionPlot'
);
