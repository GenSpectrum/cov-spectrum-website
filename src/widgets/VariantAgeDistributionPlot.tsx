import React, { useEffect, useState } from 'react';
import { DistributionType, getVariantDistributionData } from '../services/api';
import { AgeDistributionEntry } from '../services/api-types';
import { SampleSelectorSchema } from '../helpers/sample-selector';
import { Widget } from './Widget';
import * as zod from 'zod';
import { ZodQueryEncoder } from '../helpers/query-encoder';
import { fillAgeKeyedApiData } from '../helpers/fill-missing';
import { EntryWithoutCI, removeCIFromEntry } from '../helpers/confidence-interval';
import TypeDistributionChart, { TypeDistributionEntry } from '../charts/TypeDistributionChart';
import Loader from '../components/Loader';

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema>;

const VariantAgeDistributionPlot = ({ country, mutations, matchPercentage, samplingStrategy }: Props) => {
  const [distributionData, setDistributionData] = useState<EntryWithoutCI<AgeDistributionEntry>[]>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    setIsLoading(true);

    getVariantDistributionData(
      {
        distributionType: DistributionType.Age,
        country,
        mutations,
        matchPercentage,
        samplingStrategy,
      },
      signal
    )
      .then(newDistributionData => {
        if (isSubscribed) {
          setDistributionData(
            fillAgeKeyedApiData(newDistributionData.map(removeCIFromEntry), { count: 0, proportion: 0 })
          );
        }
        setIsLoading(false);
      })
      .catch(e => {
        console.log('Called fetch data error', e);
      });
    return () => {
      isSubscribed = false;
      setIsLoading(false);

      controller.abort();
    };
  }, [country, mutations, matchPercentage, samplingStrategy]);

  const processedData: TypeDistributionEntry[] | undefined = distributionData?.map(d => ({
    name: d.x,
    percent: d.y.proportion * 100,
    quantity: d.y.count,
  }));

  return processedData === undefined || isLoading ? (
    <Loader />
  ) : (
    <TypeDistributionChart data={processedData} onClickHandler={(e: unknown) => true} />
  );
};

export const VariantAgeDistributionPlotWidget = new Widget(
  new ZodQueryEncoder(PropsSchema),
  VariantAgeDistributionPlot,
  'VariantAgeDistributionPlot'
);
