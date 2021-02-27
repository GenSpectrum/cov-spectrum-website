import React, { Fragment, useEffect, useState } from 'react';
import { geoPath, geoTransform } from 'd3-geo';
import { scaleLinear, scaleThreshold, scaleOrdinal } from 'd3-scale';
import ReactTooltip from 'react-tooltip';
import { DistributionType, getVariantDistributionData } from '../../services/api';
import { TimeZipCodeDistributionEntry } from '../../services/api-types';
import { AccountService } from '../../services/AccountService';
import * as zod from 'zod';
import { SampleSelectorSchema } from '../../helpers/sample-selector';
import { scaleQuantile, ScaleQuantile } from 'd3-scale';

import styled from 'styled-components';

import bbox from '@turf/bbox';
import relief from './relief.jpg';
import geoJson from './PLZ10.json';

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema> & { width: number };

const Wrapper = styled.div`
  padding: 1rem 1rem 1rem 1rem;
`;

const Switzerland = ({ country, mutations, matchPercentage, width = 1000 }: Props) => {
  const [minX, minY, maxX, maxY] = bbox(geoJson);
  const [distributionData, setDistributionData] = useState<TimeZipCodeDistributionEntry[]>([]);

  const loggedIn = AccountService.isLoggedIn();

  useEffect(() => {
    console.log('distribution data updated...');
  }, [distributionData]);

  const height = ((maxY - minY) / (maxX - minX)) * width;
  const x = scaleLinear().range([0, width]).domain([minX, maxX]);
  const y = scaleLinear().range([0, height]).domain([maxY, minY]);
  // Custom cartesisian projection
  // https://bl.ocks.org/mbostock/6216797
  const projection = geoTransform({
    point: function (px, py) {
      this.stream.point(x(px), y(py));
    },
  });
  const path = geoPath().projection(projection);
  const colorScale = scaleQuantile<string>()
    .domain(distributionData.map((d: TimeZipCodeDistributionEntry) => d.y.count))
    .range([
      '#ffedea',
      '#ffcec5',
      '#ffad9f',
      '#ff8a75',
      '#ff5533',
      '#e2492d',
      '#be3d26',
      '#9a311f',
      '#782618',
    ]);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(DistributionType.TimeZipCode, country, mutations, matchPercentage, signal)
      .then(newDistributionData => {
        if (isSubscribed) {
          setDistributionData(newDistributionData);
        }
      })
      .catch(e => {
        // console.log('Called fetch data error', e);
      });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, mutations, matchPercentage]);

  return loggedIn && distributionData !== undefined ? (
    <>
      <h2>Number of cases by postal code in Switzerland</h2>
      <Wrapper>
        <div style={{ position: 'relative', width, height }}>
          <img src={relief} style={{ opacity: 0.4, width: '100%', height: 'auto' }} alt='' />
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            {geoJson.features.map(feature => {
              const plz = feature.properties.PLZ;
              const cur = distributionData.find(
                (s: TimeZipCodeDistributionEntry) => s.x.zipCode == plz.toString()
              );
              let caseCount: number = 0;
              if (cur !== undefined) {
                caseCount = cur.y.count;
              }
              return (
                <path
                  data-tip={`${caseCount} (PLZ ${plz})`}
                  key={`path-${plz}-${feature.properties.UUID}`}
                  stroke='#95a5a6'
                  strokeWidth={0.25}
                  d={path(feature) ?? undefined}
                  // fill={cur ? (plz < 5000 ? 'red' : 'blue') : '#ffffff00'}
                  fill={cur ? colorScale(caseCount) : '#ffffff00'}
                />
              );
            })}
          </svg>
        </div>
        <ReactTooltip />
      </Wrapper>
    </>
  ) : (
    <div></div>
  );
};

export const widthEqual = (prevProps: Props, nextProps: Props) => prevProps.width === nextProps.width;

// export default React.memo(Switzerland, widthEqual);
// export default Switzerland;
export default Switzerland;
