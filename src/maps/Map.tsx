import { VectorMap } from '@south-paw/react-vector-maps';
import { scaleQuantile } from 'd3-scale';
import React from 'react';
import styled from 'styled-components';
import switzerland from './switzerland.json';

type Data = {
  division: string | null;
  count: number;
  prevalence?: number | undefined;
}[];

interface WrapperProps {
  data: Data;
}

const colorScale = scaleQuantile<string>()
  .domain([0, 1])
  .range(['#ffedea', '#ffcec5', '#ffad9f', '#ff8a75', '#ff5533', '#e2492d', '#be3d26', '#9a311f', '#782618']);

const Wrapper = styled.div`
  svg {
    path {
      ${(p: WrapperProps) =>
        p.data.map(
          d => `&[name=${d.division}] {
        fill: ${colorScale(d.prevalence || 0)};
      }`
        )}
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
  data: Data;
}

const Map = ({ data }: Props) => {
  const [hovered, setHovered] = React.useState('None');
  const [focused, setFocused] = React.useState('None');
  const [clicked, setClicked] = React.useState('None');

  const layerProps = {
    onMouseEnter: ({ target }: MouseProps) => setHovered(target.attributes.name.value),
    onMouseLeave: ({ target }: MouseProps) => setHovered('None'),
    onFocus: ({ target }: MouseProps) => setFocused(target.attributes.name.value),
    onBlur: ({ target }: MouseProps) => setFocused('None'),
    onClick: ({ target }: MouseProps) => setClicked(target.attributes.name.value),
  };

  return (
    <Wrapper data={data}>
      <h1>This is a map</h1>
      <VectorMap {...switzerland} layerProps={layerProps} />
      <hr />
      <p>Hovered: {hovered && <code>{hovered}</code>}</p>
      <p>Focused: {focused && <code>{focused}</code>}</p>
      <p>Clicked: {clicked && <code>{clicked}</code>}</p>
    </Wrapper>
  );
};

export default Map;
