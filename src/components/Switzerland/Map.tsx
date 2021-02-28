import React, { useEffect, useState, useRef } from 'react';
import { geoPath, geoTransform } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import ReactTooltip from 'react-tooltip';
import { TimeZipCodeDistributionEntry } from '../../services/api-types';
import { scaleQuantile } from 'd3-scale';

import styled from 'styled-components';

import bbox from '@turf/bbox';
import relief from './relief.jpg';
import geoJson from './PLZ10.json';

const PADDING_SCALE = 1;
const WIDTH_ADJUST = 16 * 2 * PADDING_SCALE;

const Wrapper = styled.div`
  padding: ${PADDING_SCALE}rem ${PADDING_SCALE}rem ${PADDING_SCALE}rem 1rem;
`;

type Props = {
  width: number;
  distributionData: TimeZipCodeDistributionEntry[];
};

const Map = ({ width, distributionData }: Props) => {
  const [minX, minY, maxX, maxY] = bbox(geoJson);
  const height = ((maxY - minY) / (maxX - minX)) * (width - WIDTH_ADJUST);

  const x = scaleLinear()
    .range([0, width - WIDTH_ADJUST])
    .domain([minX, maxX]);
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

  return (
    <Wrapper>
      <div style={{ position: 'relative', width: width - WIDTH_ADJUST, height }}>
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
                fill={cur ? colorScale(caseCount) : '#ffffff00'}
              />
            );
          })}
        </svg>
      </div>
      <ReactTooltip />
    </Wrapper>
  );
};

export const isEqual = (prevProps: Props, nextProps: Props) =>
  prevProps.width === nextProps.width && prevProps.distributionData === nextProps.distributionData;

export default React.memo(Map, isEqual);
