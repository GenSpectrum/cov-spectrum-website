import React, { useState } from 'react';
// import { csv } from 'd3-fetch';
import { scaleLinear } from 'd3-scale';
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from 'react-simple-maps';

const geoUrl =
  'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json';

const colorScale = scaleLinear<String, string>().domain([0.29, 0.68]).range(['#ffedea', '#ff5233']);
interface Props {
  region: string;
}
const RegionMap = ({ region }: Props) => {
  const [data, setData] = useState([]);

  return (
    <ComposableMap
      projectionConfig={{
        rotate: [-10, 0, 0],
        scale: 147,
      }}
    >
      <Sphere stroke='#E4E5E6' strokeWidth={0.5} fill='black' id='sdlfkjsd' />
      <Graticule stroke='#E4E5E6' strokeWidth={0.5} />
      {data.length > 0 && (
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              // const d = data.find(s => s?.ISO3 === geo.properties.ISO_A3);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={true ? colorScale(Math.random() * 10) : '#F5F4F6'}
                />
              );
            })
          }
        </Geographies>
      )}
    </ComposableMap>
  );
};

export default RegionMap;
