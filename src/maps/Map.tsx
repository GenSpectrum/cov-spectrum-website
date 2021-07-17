import { VectorMap } from '@south-paw/react-vector-maps';
import { scaleQuantile } from 'd3-scale';
import React, { useState } from 'react';
import styled from 'styled-components';
import switzerland from './switzerland.json';
import { ChartAndMetrics, colors } from '../charts/Metrics';

type Data = {
  division: string | null;
  count: number;
  prevalence?: number | undefined;
};

interface WrapperProps {
  data: Data[];
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
        fill: ${colorScale(d.prevalence || 0)};
        &:hover {
          stroke-width: 4px;
        }
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
}

const Map = ({ data }: Props) => {
  const [hovered, setHovered] = React.useState('None');
  const [focused, setFocused] = React.useState('None');
  const [clicked, setClicked] = React.useState('None');
  const [focusData, setFocusData] = useState<Data | undefined>(undefined);

  const layerProps = {
    onMouseEnter: ({ target }: MouseProps) => {
      const newData = data.find(d => d.division === target.attributes.name.value);
      setFocusData(newData);
    },
    // onMouseEnter: ({ target }: MouseProps) => setHovered(target.attributes.name.value),
    // onMouseLeave: ({ target }: MouseProps) => setHovered('None'),
    // onFocus: ({ target }: MouseProps) => setFocused(target.attributes.name.value),
    // onClick: ({ target }: MouseProps) => setClicked(target.attributes.name.value),
  };

  const metrics = focusData
    ? [
        {
          value: focusData.prevalence ? focusData.prevalence.toFixed(2) : 0,
          title: 'Prevalence',
          color: colors.active,
          helpText: 'Proportion relative to all samples collected from this age group.',
          percent: true,
        },
        {
          value: focusData.count,
          title: 'Samples',
          color: colors.secondary,
          helpText: 'Number of samples of the variant collected from this age group.',
        },
      ]
    : [];

  return (
    <ChartAndMetrics
      metrics={metrics}
      title={`Proportion of variant ${focusData ? 'in ' + focusData.division : ''}`}
    >
      <Wrapper data={data} className='pd-1 md:m-2'>
        <VectorMap {...switzerland} layerProps={layerProps} />
      </Wrapper>
    </ChartAndMetrics>
  );
};

export default Map;
