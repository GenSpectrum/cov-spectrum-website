import React, { useState, useMemo } from 'react';
import { scaleQuantile } from 'd3-scale';
import styled from 'styled-components';
import { ChartAndMetrics } from '../charts/Metrics';
import { Place } from '../services/api-types';
import { colors } from '../charts/common';
import brazil from './brazil.json';
import china from './china.json';
import france from './france.json';
import germany from './germany.json';
import italy from './italy.json';
import japan from './japan.json';
import spain from './spain.json';
import switzerland from './switzerland.json';
import usa from './usa.json';

export interface VectorMapLayer {
  /** Unique ID of each layer. */
  id: string;
  /** Name of the layer. */
  name: string;
  /** SVG path for the layer. */
  d: string;
}

export interface VectorMapProps {
  /** Unique ID of the SVG element. */
  id: string;
  /** Name of the map. */
  name: string;
  /** View box for the map. */
  viewBox: string;
  /** Layers that represent the regions of the map. */
  layers: VectorMapLayer[];
  /** Tab index for each layer. Set to '-1' to disable layer focusing. */
  tabIndex?: number;
  /** Props to spread onto each layer. */
  layerProps?: any;
  /** Layer IDs to 'select' with the 'aria-checked' attribute. */
  checkedLayers?: string[];
  /** Layer IDs to 'select' with the 'aria-current' attribute. */
  currentLayers?: string[];
}

const VectorMap: React.FC<VectorMapProps> = ({
  id,
  name,
  layers,
  tabIndex = 0,
  layerProps,
  checkedLayers,
  currentLayers,
  children,
  ...other
}) => {
  if (!layers || layers.length === 0) {
    // eslint-disable-next-line no-console
    console.error(
      `[react-vector-maps] No 'layers' prop provided. Did you spread a map object onto the component?`
    );
    return null;
  }

  return (
    <svg xmlns='http://www.w3.org/2000/svg' key={id} aria-label={name} {...other}>
      {children}
      {layers.map(layer => (
        <path
          key={layer.id}
          tabIndex={tabIndex}
          aria-label={layer.name}
          aria-checked={checkedLayers && checkedLayers.includes(layer.id)}
          aria-current={currentLayers && currentLayers.includes(layer.id)}
          {...layer}
          {...layerProps}
        />
      ))}
    </svg>
  );
};

type Data = {
  division: string | null;
  count: number;
  prevalence?: number | undefined;
};

interface WrapperProps {
  data: Data[];
  focusDivision: string | null;
}

const colorScale = scaleQuantile<string>()
  .domain([0, 100])
  .range(['#ffedea', '#ffcec5', '#ffad9f', '#ff8a75', '#ff5533', '#e2492d', '#be3d26', '#9a311f', '#782618']);

const Wrapper = styled.div`
  svg {
    max-height: 500px;
    margin-left: auto;
    margin-right: auto;
    path {
      cursor: pointer;
      outline: none;
      stroke: black;
      fill: white;
      ${(p: WrapperProps) =>
        p.data.map(d => {
          return `&[name="${d.division}"] {
        fill: ${
          p.focusDivision !== null && p.focusDivision === d.division
            ? colors.active
            : colorScale(d.prevalence || 0)
        };
      }`;
        })}
      &:hover {
        fill: ${colors.active};
      }
    }
  }
`;

type Target = {
  attributes: {
    name: {
      value: string;
    };
  };
};

interface MouseProps {
  target: Target;
}

interface Props {
  data: Data[];
  country: Place;
}

const Map = ({ data: inputData, country }: Props) => {
  const [focusData, setFocusData] = useState<Data | undefined>(undefined);

  const data = inputData.map(d => ({ ...d, prevalence: d.prevalence ? d.prevalence * 100 : 0 }));

  const layerProps = {
    onMouseEnter: ({ target }: MouseProps) => {
      const newData = data.find(d => d.division === target.attributes.name.value);
      if (newData) {
        setFocusData(newData);
      } else {
        setFocusData({
          division: target.attributes.name.value,
          count: 0,
          prevalence: 0,
        });
      }
    },
    onMouseLeave: () => setFocusData(undefined),
  };

  const minPrevalence = useMemo(
    () => data.map((d: Data) => (d.prevalence ? d.prevalence : 0)).reduce((a, b) => Math.min(a, b), Infinity),
    [data]
  );
  const maxPrevalence = useMemo(
    () => data.map((d: Data) => (d.prevalence ? d.prevalence : 0)).reduce((a, b) => Math.max(a, b), 0),
    [data]
  );

  const getNumberOfDivisions = () => {
    switch (country) {
      case 'Switzerland':
        return switzerland.layers.length;
      case 'Germany':
        return germany.layers.length;
      case 'United States':
        return usa.layers.length;
      default:
        return 0;
    }
  };

  const metrics = [
    {
      value: focusData
        ? focusData.prevalence
          ? focusData.prevalence.toFixed(2)
          : 0
        : `${(Math.round(minPrevalence * 100) / 100).toString()}-${Math.round(
            (maxPrevalence * 100) / 100
          ).toString()}`,
      title: focusData ? 'Prevalence' : 'Prevalence range',
      color: colors.active,
      helpText: 'Proportion relative to all samples collected from this age group.',
      percent: true,
    },
    {
      value: focusData ? focusData.count : getNumberOfDivisions(),
      title: focusData ? 'Samples' : 'Divisions',
      color: colors.secondary,
      helpText: focusData
        ? 'Number of samples of the variant collected from this age group.'
        : 'Number of divisions with prevalence data. Some divisions may not be visible.',
    },
  ];

  return (
    <ChartAndMetrics
      metrics={metrics}
      title={`Average proportion during selected timeframe`}
      metricsTitle={focusData && focusData.division !== null ? focusData.division : undefined}
    >
      <Wrapper data={data} focusDivision={focusData ? focusData.division : null} className='pd-1 md:m-2'>
        {country === 'Brazil' && <VectorMap {...brazil} layerProps={layerProps} />}
        {country === 'China' && <VectorMap {...china} layerProps={layerProps} />}
        {country === 'France' && <VectorMap {...france} layerProps={layerProps} />}
        {country === 'Germany' && <VectorMap {...germany} layerProps={layerProps} />}
        {country === 'Italy' && <VectorMap {...italy} layerProps={layerProps} />}
        {country === 'Japan' && <VectorMap {...japan} layerProps={layerProps} />}
        {country === 'Spain' && <VectorMap {...spain} layerProps={layerProps} />}
        {country === 'Switzerland' && <VectorMap {...switzerland} layerProps={layerProps} />}
        {country === 'United States' && <VectorMap {...usa} layerProps={layerProps} />}
      </Wrapper>
    </ChartAndMetrics>
  );
};

export default Map;
