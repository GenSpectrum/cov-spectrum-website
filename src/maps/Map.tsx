import { VectorMap } from '@south-paw/react-vector-maps';
import { scaleQuantile } from 'd3-scale';
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import switzerland from './switzerland.json';
import germany from './germany.json';
import usa from './usa.json';
import { ChartAndMetrics, colors } from '../charts/Metrics';
import { Place } from '../services/api-types';

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
  .domain([0, 1])
  .range(['#ffedea', '#ffcec5', '#ffad9f', '#ff8a75', '#ff5533', '#e2492d', '#be3d26', '#9a311f', '#782618']);

const Wrapper = styled.div`
  svg {
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

const Map = ({ data, country }: Props) => {
  const [focusData, setFocusData] = useState<Data | undefined>(undefined);

  const layerProps = {
    onMouseEnter: ({ target }: MouseProps) => {
      const newData = data.find(d => d.division === target.attributes.name.value);
      newData && setFocusData(newData);
    },
    onMouseLeave: ({ target }: MouseProps) => setFocusData(undefined),
  };

  const minPrevalence = useMemo(
    () => data.map((d: Data) => (d.prevalence ? d.prevalence : 0)).reduce((a, b) => Math.min(a, b), Infinity),
    [data]
  );
  const maxPrevalence = useMemo(
    () => data.map((d: Data) => (d.prevalence ? d.prevalence : 0)).reduce((a, b) => Math.max(a, b), 0),
    [data]
  );

  const metrics = [
    {
      value: focusData
        ? focusData.prevalence
          ? focusData.prevalence.toFixed(2)
          : 0
        : `${minPrevalence.toFixed(2)}-${maxPrevalence.toFixed(2)}`,
      title: focusData ? 'Prevalence' : 'Prevalence range',
      color: colors.active,
      helpText: 'Proportion relative to all samples collected from this age group.',
      percent: true,
    },
    {
      value: focusData ? focusData.count : data.length,
      title: focusData ? 'Samples' : 'Divisions with data',
      color: colors.secondary,
      helpText: focusData
        ? 'Number of samples of the variant collected from this age group.'
        : 'Number of divisions with prevalence data',
    },
  ];

  return (
    <ChartAndMetrics
      metrics={metrics}
      title={`Proportion of variant ${focusData ? 'in ' + focusData.division : ''}`}
      metricsTitle={focusData && focusData.division !== null ? focusData.division : undefined}
    >
      <Wrapper data={data} focusDivision={focusData ? focusData.division : null} className='pd-1 md:m-2'>
        {country === 'Switzerland' && <VectorMap {...switzerland} layerProps={layerProps} />}
        {country === 'Germany' && <VectorMap {...germany} layerProps={layerProps} />}
        {country === 'United States' && <VectorMap {...usa} layerProps={layerProps} />}
      </Wrapper>
    </ChartAndMetrics>
  );
};

export default Map;
