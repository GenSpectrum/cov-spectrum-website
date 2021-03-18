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
      <div style={{ margin: '0 -0.25rem 4px -0.25rem' }}>
        <Button variant='secondary' size='sm' className='ml-1' onClick={() => setLogScale(v => !v)}>
          Toggle log scale
        </Button>
        {AccountService.isLoggedIn() && (
          <Button
            variant='secondary'
            size='sm'
            className='ml-1'
            onClick={() =>
              NextcladeService.showVariantOnNextclade({
                variant,
                matchPercentage,
                country: undefined,
                samplingStrategy: toLiteralSamplingStrategy(SamplingStrategy.AllSamples),
              })
            }
          >
            Show on Nextclade
          </Button>
        )}
        <LazySampleButton
          query={{
            variantSelector: { variant, matchPercentage },
            country: undefined,
            samplingStrategy: SamplingStrategy.AllSamples,
          }}
          variant='secondary'
          size='sm'
          className='ml-1'
        >
          Show worldwide samples
        </LazySampleButton>
      </div>

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

      {countryData ? (
        <>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Total Variant Sequences</th>
                  <th>First seq. found at</th>
                  <th>Last seq. found at</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {countryData.map((c: any) => (
                  <tr key={c.country}>
                    <td>{c.country}</td>
                    <td>{c.count}</td>
                    <td>{c.first.yearWeek}</td>
                    <td>{c.last.yearWeek}</td>
                    <td>
                      {AccountService.isLoggedIn() && (
                        <Button
                          onClick={() =>
                            NextcladeService.showVariantOnNextclade({
                              variant,
                              matchPercentage,
                              country: c.country,
                              samplingStrategy: toLiteralSamplingStrategy(SamplingStrategy.AllSamples),
                            })
                          }
                          variant='secondary'
                          size='sm'
                          className='mr-2'
                        >
                          Show on Nextclade
                        </Button>
                      )}
                      <LazySampleButton
                        query={{
                          variantSelector: { variant, matchPercentage },
                          country: c.country,
                          samplingStrategy: SamplingStrategy.AllSamples,
                        }}
                        variant='secondary'
                        size='sm'
                      >
                        Show samples
                      </LazySampleButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      ) : null}
    </>
  );
};
