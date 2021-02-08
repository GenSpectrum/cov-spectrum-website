import React, { useState, useEffect } from 'react';
import { BackendService } from '../services/BackendService';
import Table from 'react-bootstrap/Table';
import { Utils } from '../services/Utils';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { VariantInternationalComparisonPlot } from '../widgets/VariantInternationalComparisonPlot';
import { WidgetWrapper } from './WidgetWrapper';
import { dataToUrl } from '../helpers/urlConversion';
import { fetchVariantDistributionData } from '../services/api';

export const InternationalComparison = ({ country, matchPercentage, variant }) => {
  const [distribution, setDistribution] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    const mutationsString = variant.mutations.join(',');
    fetchVariantDistributionData('International', null, mutationsString, matchPercentage, signal).then(
      newDistributionData => {
        if (isSubscribed) {
          console.log('TIME SET', newDistributionData);
          setDistribution(newDistributionData);
        } else {
          console.log('TIME NOT SET');
        }
      }
    );
    return () => {
      isSubscribed = false;
      controller.abort();
      console.log('TIME Cleanup render for variant age distribution plot');
    };
  }, [country, matchPercentage, variant]);

  // componentDidMount() {
  //   this.updateView();
  // }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   // TODO Use a better equality check for the variant
  //   if (
  //     prevProps.variant !== this.props.variant ||
  //     prevProps.country !== this.props.country ||
  //     prevProps.matchPercentage !== this.props.matchPercentage
  //   ) {
  //     this.updateView();
  //   }
  // }

  // async updateView() {
  //   this.loadInternationalTimeDistribution();
  // }

  // async loadInternationalTimeDistribution() {
  //   this.state.req?.cancel();
  //   this.setState({ distribution: null });

  //   const mutationsString = this.props.variant.mutations.join(',');
  //   const endpoint = '/plot/variant/international-time-distribution';
  //   const req = BackendService.get(
  //     `${endpoint}?mutations=${mutationsString}` + `&matchPercentage=${this.props.matchPercentage}`
  //   );
  //   this.setState({ req });

  //   const distribution = await (await req).json();
  //   this.setState({ distribution });
  // }

  const [countryData, setCountryData] = useState([]);

  useEffect(() => {
    let isSubscribed = true;
    const aggregated = Utils.groupBy(distribution, d => d.x.country);
    const newCountryData = [];
    aggregated?.forEach((value, name) => {
      newCountryData.push(
        value.reduce(
          (aggregated, entry) => ({
            country: aggregated.country,
            count: aggregated.count + entry.y.count,
            first: Utils.minBy(aggregated.first, entry.x.week, w => w.firstDayInWeek),
            last: Utils.maxBy(aggregated.last, entry.x.week, w => w.firstDayInWeek),
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
                {countryData.map(c => (
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
