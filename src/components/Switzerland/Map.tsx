import bbox from '@turf/bbox';
import { geoPath, geoTransform } from 'd3-geo';
import { scaleLinear, scaleQuantile } from 'd3-scale';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import geoJson from './PLZ10.json';
import relief from './relief.jpg';

type Props = {
  width: number;
  casesByZipCode: Map<string, number>;
};

const Map = ({ width, casesByZipCode }: Props) => {
  const [minX, minY, maxX, maxY] = bbox(geoJson);
  const height = ((maxY - minY) / (maxX - minX)) * width;
  const x = scaleLinear().range([0, width]).domain([minX, maxX]);
  const y = scaleLinear().range([0, height]).domain([maxY, minY]);
  // https://bl.ocks.org/mbostock/6216797
  const projection = geoTransform({
    point: function (px, py) {
      this.stream.point(x(px), y(py));
    },
  });
  const path = geoPath().projection(projection);
  const colorScale = scaleQuantile<string>()
    .domain(casesByZipCode.values())
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
    <div>
      <div style={{ position: 'relative', width: width, height }}>
        <img src={relief} style={{ opacity: 0.4, width: '100%', height: 'auto' }} alt='' />
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
          {geoJson.features.map(feature => {
            const plz: number = feature.properties.PLZ;
            const caseCount: number = casesByZipCode.get('' + plz) ?? 0;
            return (
              <path
                data-tip={`${caseCount} (PLZ ${plz})`}
                key={`path-${plz}-${feature.properties.UUID}`}
                stroke='#95a5a6'
                strokeWidth={0.25}
                d={path(feature) ?? undefined}
                fill={caseCount ? colorScale(caseCount) : '#ffffff00'}
              />
            );
          })}
        </svg>
      </div>
      <ReactTooltip />
    </div>
  );
};

export default React.memo(Map);
