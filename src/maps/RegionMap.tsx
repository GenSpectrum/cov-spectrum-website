import React, { useEffect, useState } from 'react';
// import { csv } from 'd3-fetch';
import { scaleLinear } from 'd3-scale';
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from 'react-simple-maps';
import { default as world } from './world.json';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import ReactTooltip from 'react-tooltip';

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
  data: { country: string; value: number }[];
}
const RegionMap = ({ selector, data }: Props) => {
  const [tooltipContent, setTooltipContent] = useState('help');
  const values: number[] = data.map(s => s.value);
  const colorScale = scaleLinear<String, string>()
    .domain([0, Math.max(...values)])
    .range(['#ffedea', '#ff5233']);
  const randomTooltipId = Math.random() * 5 + '';

  useEffect(() => {
    ReactTooltip.rebuild();
    console.log('rebuild');
  }, [tooltipContent]);
  return (
    <>
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
        height={400}
      >
        <Sphere stroke='#E4E5E6' strokeWidth={0.5} fill='transparent' id='background-sphere' />
        <Graticule stroke='#E4E5E6' strokeWidth={0.5} />
        {
          <Geographies geography={world} data-for={randomTooltipId} data-tip={tooltipContent}>
            {({ geographies }) =>
              geographies.map(geo => {
                const d = data.find(s => s?.country === geo.properties.NAME_LONG);
                return (
                  <Geography
                    onMouseEnter={() => {
                      setTooltipContent(`${geo.properties.NAME_LONG}${d ? ' (' + d.value + ')' : ' (n/a)'}`);
                    }}
                    onClick={() => {
                      setTooltipContent(`${geo.properties.NAME_LONG}${d ? ' (' + d.value + ')' : ' (n/a)'}`);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent('');
                    }}
                    key={geo.rsmKey}
                    geography={geo}
                    fill={d ? colorScale(d.value) : '#F5F4F6'}
                  />
                );
              })
            }
          </Geographies>
        }
      </ComposableMap>
      <ReactTooltip id={randomTooltipId}></ReactTooltip>
    </>
  );
};

export default RegionMap;
