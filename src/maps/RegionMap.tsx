import React, { useState } from 'react';
// import { csv } from 'd3-fetch';
import { scaleLinear } from 'd3-scale';
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from 'react-simple-maps';
import { default as world } from './world.json';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';

export enum REGION {
  WORLD = 'world',
  EUROPE = 'europe',
  AFRICA = 'africa',
  AMERICA = 'america',
  ASIA = 'asia',
  OCEANIA = 'oceania',
}

interface Props {
  selector: LocationDateVariantSelector;
}
const RegionMap = ({ selector }: Props) => {
  const [data, setData] = useState([]);
  const colorScale = scaleLinear<String, string>().domain([0.29, 0.68]).range(['#ffedea', '#ff5233']);
  return (
    <ComposableMap
      projectionConfig={{
        rotate: [-10, 0, 0],
        scale: 147,
      }}
    >
      <Sphere stroke='#E4E5E6' strokeWidth={0.5} fill='transparent' id='background-sphere' />
      <Graticule stroke='#E4E5E6' strokeWidth={0.5} />
      {
        <Geographies geography={world}>
          {({ geographies }) =>
            geographies.map(geo => {
              // const d = data.find(s => s?.ISO3 === geo.properties.ISO_A3);
              // console.log(geo);
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
      }
    </ComposableMap>
  );
};

export default RegionMap;
