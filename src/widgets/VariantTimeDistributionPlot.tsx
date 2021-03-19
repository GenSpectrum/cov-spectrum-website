import React, { useState, useEffect, useCallback } from 'react';
import { DistributionType, getVariantDistributionData } from '../services/api';
import { TimeDistributionEntry } from '../services/api-types';
import { SampleSelectorSchema } from '../helpers/sample-selector';
import { Widget } from './Widget';
import * as zod from 'zod';
import { ZodQueryEncoder } from '../helpers/query-encoder';

import { fillWeeklyApiData } from '../helpers/fill-missing';
import { EntryWithoutCI, removeCIFromEntry } from '../helpers/confidence-interval';
import TimeChart, { TimeEntry } from '../charts/TimeChart';

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

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
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
    });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, mutations, matchPercentage, samplingStrategy]);

  const processedData: TimeEntry[] | undefined = distribution?.map(d => ({
    firstDayInWeek: d.x.firstDayInWeek,
    yearWeek: d.x.yearWeek,
    percent: d.y.proportion * 100,
    quantity: d.y.count,
  }));

  return processedData === undefined ? (
    <p>Loading</p>
  ) : (
    <TimeChart data={processedData} onClickHandler={(e: unknown) => true} />
  );
};

//type for when a graph element is clicked

export const VariantTimeDistributionPlotWidget = new Widget(
  new ZodQueryEncoder(PropsSchema),
  VariantTimeDistributionPlot,
  'VariantTimeDistributionPlot'
);
