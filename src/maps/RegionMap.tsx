import React, { useState } from 'react';
// import { csv } from 'd3-fetch';
import { scaleLinear } from 'd3-scale';
import { ComposableMap, Geographies, Geography, Sphere, Graticule, ZoomableGroup } from 'react-simple-maps';
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

const HEIGHT = 400;
interface Props {
  selector?: LocationDateVariantSelector;
  data: { country: string; value: number }[];
}
const RegionMap = ({ data }: Props) => {
  const [tooltipContent, setTooltipContent] = useState('help');
  const values: number[] = data.map(s => s.value);
  const colorScale = scaleLinear<String, string>()
    .domain([0, Math.max(...values)])
    .range(['#edafa5', '#bb1919']);
  const hoverColorScale = scaleLinear<String, string>()
    .domain([0, Math.max(...values)])
    .range(['#a5a5ed', '#2237a9']);
  const randomTooltipId = Math.random() * 5 + '';

  return (
    <>
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
        height={HEIGHT}
      >
        <ZoomableGroup disablePanning={true} maxZoom={8}>
          <Sphere stroke='#E4E5E6' strokeWidth={0.5} fill='transparent' id='background-sphere' />
          <Graticule stroke='#E4E5E6' strokeWidth={0.5} />
          {
            <Geographies geography={world} data-for={randomTooltipId} data-tip=''>
              {({ geographies }) =>
                geographies.map(geo => {
                  const d = data.find(s => s?.country === geo.properties.NAME_LONG);
                  return (
                    <Geography
                      onMouseEnter={() => {
                        setTooltipContent(
                          `${geo.properties.NAME_LONG}${d ? ' (' + d.value + ')' : ' (N/A)'}`
                        );
                      }}
                      onMouseLeave={() => {
                        setTooltipContent('');
                      }}
                      key={geo.rsmKey}
                      geography={geo}
                      fill={d ? colorScale(d.value) : '#F5F4F6'}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', fill: d ? hoverColorScale(d.value) : '#aeaeae' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          }
        </ZoomableGroup>
      </ComposableMap>
      <ReactTooltip className='bg-black shadow-xl' id={randomTooltipId}>
        {tooltipContent}
      </ReactTooltip>
    </>
  );
};

export default RegionMap;
