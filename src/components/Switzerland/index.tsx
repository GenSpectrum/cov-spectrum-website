import React, { Fragment, useEffect, useState } from 'react';
import { geoPath, geoTransform } from 'd3-geo';
import { scaleLinear, scaleThreshold, scaleOrdinal } from 'd3-scale';
import ReactTooltip from 'react-tooltip';
import { DistributionType, getVariantDistributionData } from '../../services/api';
import { TimeZipCodeDistributionEntry } from '../../services/api-types';
import { AccountService } from '../../services/AccountService';
import * as zod from 'zod';
import { SampleSelectorSchema } from '../../helpers/sample-selector';
import { scaleQuantile } from 'd3-scale';

import bbox from '@turf/bbox';
import relief from './relief.jpg';
import geoJson from './PLZ10.json';

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema> & { width: number };

const Switzerland = ({ country, mutations, matchPercentage, width = 1000 }: Props) => {
  const [minX, minY, maxX, maxY] = bbox(geoJson);
  const [distributionData, setDistributionData] = useState<TimeZipCodeDistributionEntry[] | undefined>(
    undefined
  );

  const loggedIn = AccountService.isLoggedIn();

  useEffect(() => {
    console.log('started...');
  }, []);

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

  // svg paths from geoJson feature
  const path = geoPath().projection(projection);

  // const colorScale = scaleQuantile()
  // .domain(data.map(d => d.unemployment_rate))
  // .range([
  //   "#ffedea",
  //   "#ffcec5",
  //   "#ffad9f",
  //   "#ff8a75",
  //   "#ff5533",
  //   "#e2492d",
  //   "#be3d26",
  //   "#9a311f",
  //   "#782618"
  // ]);
  const [colorScale, setColorScale] = useState(undefined);

  useEffect(() => {
    if (distributionData !== undefined) {
      const newScale = scaleQuantile<string, number>()
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
      setColorScale(newScale);
    }
  }, [distributionData]);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(DistributionType.TimeZipCode, country, mutations, matchPercentage, signal)
      .then(newDistributionData => {
        if (isSubscribed) {
          setDistributionData(newDistributionData);
        }
        console.log('new distribution data is', newDistributionData);
      })
      .catch(e => {
        console.log('Called fetch data error', e);
      });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, mutations, matchPercentage]);

  return loggedIn && distributionData !== undefined ? (
    <div>
      <h1>Number of cases by postal code</h1>
      <div style={{ position: 'relative', width, height }}>
        <img src={relief} style={{ opacity: 0.4, width: '100%', height: 'auto' }} alt='' />
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
          {geoJson.features.map(feature => {
            const plz = feature.properties.PLZ;
            const cur = distributionData.find(
              (s: TimeZipCodeDistributionEntry) => s.x.zipCode == plz.toString()
            );
            return (
              <path
                data-tip={`${cur != undefined ? cur.y.count : 0} (PLZ ${plz})`}
                key={`path-${plz}-${feature.properties.UUID}`}
                stroke='#95a5a6'
                strokeWidth={0.25}
                d={path(feature) ?? undefined}
                fill={cur ? (plz < 5000 ? 'red' : 'blue') : '#ffffff00'}
              />
            );
          })}
        </svg>
      </div>
      <ReactTooltip />
    </div>
  ) : (
    <div></div>
  );
};

export const widthEqual = (prevProps: Props, nextProps: Props) => prevProps.width === nextProps.width;

export default React.memo(Switzerland, widthEqual);
