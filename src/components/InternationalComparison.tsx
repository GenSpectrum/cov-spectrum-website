import React, { useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { AccountService } from '../services/AccountService';
import {
  DistributionType,
  getVariantDistributionData,
  SamplingStrategy,
  toLiteralSamplingStrategy,
} from '../services/api';
import { Country, InternationalTimeDistributionEntry, Variant } from '../services/api-types';
import { NextcladeService } from '../services/NextcladeService';
import { Utils } from '../services/Utils';
import { VariantInternationalComparisonPlotWidget } from '../widgets/VariantInternationalComparisonPlot';
import { LazySampleButton } from './LazySampleButton';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
}

export const InternationalComparison = ({
  country,
  matchPercentage,
  variant,
  samplingStrategy: requestedSamplingStrategy,
}: Props) => {
  const [distribution, setDistribution] = useState<InternationalTimeDistributionEntry[] | null>(null);
  const [logScale, setLogScale] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(
      {
        distributionType: DistributionType.International,
        country: undefined,
        mutations: variant.mutations,
        matchPercentage,
        samplingStrategy: toLiteralSamplingStrategy(SamplingStrategy.AllSamples),
      },
      signal
    ).then(newDistributionData => {
      if (isSubscribed) {
        setDistribution(newDistributionData);
      }
    });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [matchPercentage, variant]);

  const [countryData, setCountryData] = useState<any>([]);

  useEffect(() => {
    let isSubscribed = true;
    const newCountryData: any[] = [];
    if (distribution) {
      const aggregated = Utils.groupBy(distribution, (d: any) => d.x.country);
      aggregated?.forEach((value, name) => {
        newCountryData.push(
          value.reduce(
            (aggregated: any, entry: any) => ({
              country: aggregated.country,
              count: aggregated.count + entry.y.count,
              first: Utils.minBy(aggregated.first, entry.x.week, (w: any) => w.firstDayInWeek),
              last: Utils.maxBy(aggregated.last, entry.x.week, (w: any) => w.firstDayInWeek),
            }),
            {
              country: name,
              count: 0,
              first: {
                firstDayInWeek: Infinity,
                yearWeek: 'XXXX-XX',
              },
              last: {
                firstDayInWeek: -Infinity,
                yearWeek: 'XXXX-XX',
              },
            }
          )
        );
      });
    }
    if (isSubscribed === true) {
      setCountryData(newCountryData);
    }
    return () => {
      isSubscribed = false;
    };
  }, [distribution]);

  return (
    <>
      {requestedSamplingStrategy !== SamplingStrategy.AllSamples && (
        <Alert variant='warning'>
          The selected sampling strategy can not be used for international comparison. Showing all samples
          instead.
        </Alert>
      )}

      <VariantInternationalComparisonPlotWidget.ShareableComponent
        height={500}
        country={country}
        matchPercentage={matchPercentage}
        mutations={variant.mutations}
        logScale={logScale}
      />
    </>
  );
};
