import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { Utils } from '../services/Utils';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { VariantInternationalComparisonPlot } from '../widgets/VariantInternationalComparisonPlot';
import { WidgetWrapper } from './WidgetWrapper';
import { dataToUrl } from '../helpers/urlConversion';
import { DistributionType, getVariantDistributionData } from '../services/api';
import { InternationalTimeDistributionEntry } from '../services/api-types';

interface Props {
  country: string;
  matchPercentage: number;
  variant: {
    mutations: string[];
    name: string;
  };
}
export const InternationalComparison = ({ country, matchPercentage, variant }: Props) => {
  const [distribution, setDistribution] = useState<InternationalTimeDistributionEntry[] | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(
      DistributionType.International,
      null,
      variant.mutations,
      matchPercentage,
      signal
    ).then(newDistributionData => {
      if (isSubscribed) {
        // console.log('TIME SET', newDistributionData);
        setDistribution(newDistributionData);
      } else {
        // console.log('TIME NOT SET');
      }
    });
    return () => {
      isSubscribed = false;
      controller.abort();
      // console.log('TIME Cleanup render for variant age distribution plot');
    };
  }, [country, matchPercentage, variant]);

  const [countryData, setCountryData] = useState<any>([]);

  useEffect(() => {
    let isSubscribed = true;
    const aggregated = Utils.groupBy(distribution, (d: any) => d.x.country);
    const newCountryData: any[] = [];
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
    if (isSubscribed === true) {
      setCountryData(newCountryData);
    }
    return () => {
      isSubscribed = false;
    };
  }, [distribution]);

  const plotData = {
    country: country,
    matchPercentage: matchPercentage,
    mutations: variant.mutations,
  };

  return (
    <>
      <div style={{ display: 'flex' }}>
        <h3 style={{ flexGrow: 1 }}>{variant.name ?? 'Unnamed Variant'} - International Comparison</h3>
        <div>
          <Link
            to={'/sample?mutations=' + variant.mutations.join(',') + '&matchPercentage=' + matchPercentage}
          >
            <Button variant='outline-dark' size='sm'>
              Show all samples
            </Button>
          </Link>
        </div>
      </div>
      <div style={{ height: '500px' }}>
        <WidgetWrapper shareUrl={dataToUrl(plotData, 'VariantInternationalComparison')}>
          <VariantInternationalComparisonPlot data={plotData} />
        </WidgetWrapper>
      </div>
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
                      <Link
                        to={
                          '/sample?mutations=' +
                          variant.mutations.join(',') +
                          '&country=' +
                          c.country +
                          '&matchPercentage=' +
                          matchPercentage
                        }
                      >
                        <Button variant='outline-dark' size='sm'>
                          Show samples
                        </Button>
                      </Link>
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
