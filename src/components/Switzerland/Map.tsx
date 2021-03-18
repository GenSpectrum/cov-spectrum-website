import React from 'react';
import { geoPath, geoTransform } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import ReactTooltip from 'react-tooltip';
import { TimeZipCodeDistributionEntry } from '../../services/api-types';
import { scaleQuantile } from 'd3-scale';

import bbox from '@turf/bbox';
import relief from './relief.jpg';
import geoJson from './PLZ10.json';

type Props = {
  width: number | undefined;
  distributionData: TimeZipCodeDistributionEntry[];
};

const Map = ({ width, distributionData }: Props) => {
  const activeWidth = width !== undefined ? width : 0;
  const [minX, minY, maxX, maxY] = bbox(geoJson);
  const height = ((maxY - minY) / (maxX - minX)) * activeWidth;
  const x = scaleLinear().range([0, activeWidth]).domain([minX, maxX]);
  const y = scaleLinear().range([0, height]).domain([maxY, minY]);
  // https://bl.ocks.org/mbostock/6216797
  const projection = geoTransform({
    point: function (px, py) {
      this.stream.point(x(px), y(py));
    },
  });
  const path = geoPath().projection(projection);
  const colorScale = scaleQuantile<string>()
    .domain(distributionData.map((d: TimeZipCodeDistributionEntry) => d.y.count))
    .range(['#f18805']);

  return width !== undefined ? (
    <div>
      <div style={{ position: 'relative', width: width, height }}>
        <img src={relief} style={{ opacity: 0.4, width: '100%', height: 'auto' }} alt='' />
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
          {geoJson.features.map(feature => {
            const plz = feature.properties.PLZ;
            const cur = distributionData.find(
              (s: TimeZipCodeDistributionEntry) => s.x.zipCode === plz.toString()
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
    </div>
  ) : (
    <></>
  );
};

export default React.memo(Map);
