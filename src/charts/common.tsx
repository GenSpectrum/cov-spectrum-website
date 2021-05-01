import styled from 'styled-components';

export const colors = {
  active: '#2980b9',
  activeSecondary: '#3498db',
  inactive: '#bdc3c7',
  inactiveSecondary: '#ecf0f1',
  secondary: '#7f8c8d',
  secondaryLight: '#95a5a6',
  highlight: '#c0392b',
  highlight2: '#e74c3c',
};

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
export const TitleWrapper = styled.div`
  padding: 0.5rem 0rem 1rem 0rem;
  font-size: 1.2rem;
  line-height: 1.3;
  color: ${colors.secondary};
`;
export const ChartAndMetricsWrapper = styled.div`
  display: flex;
  flex: 1;
`;

export const ChartWrapper = styled.div`
  flex-grow: 1;
  width: 10rem;
`;

const getTimeTickText = (value: string, dataLength: number, activeIndex: number, index: number) => {
  if (dataLength > 25) {
    if (activeIndex === index) {
      return value.slice(5);
    } else if (Math.abs(activeIndex - index) <= 2) {
      return '';
    } else if (index % 5 === 0) {
      return value.slice(5);
    }
  } else if (dataLength > 15) {
    if (activeIndex === index) {
      return value.slice(5);
    } else if (Math.abs(activeIndex - index) <= 1) {
      return '';
    } else if (index % 2 === 0) {
      return value.slice(5);
    }
  } else if (dataLength > 12) {
    return value.slice(5);
  } else if (dataLength > 5) {
    return value.slice(2);
  } else {
    return value;
  }
};

export type CustomTimeTickProps = {
  x?: number;
  y?: number;
  stroke?: unknown;
  payload?: { value: string; index: number };
  activeIndex: number;
  dataLength: number;
  currentValue: string;
};

export const CustomTimeTick = ({
  x,
  y,
  payload,
  activeIndex,
  dataLength,
  currentValue,
}: CustomTimeTickProps): JSX.Element => {
  return (
    <g transform={`translate(${x},${y})`}>
      {payload ? (
        <text
          x={0}
          y={0}
          dx={0}
          dy={10}
          textAnchor='middle'
          fill={payload.value === currentValue ? colors.active : colors.inactive}
        >
          {getTimeTickText(payload.value, dataLength, activeIndex, payload.index)}
        </text>
      ) : (
        <></>
      )}
    </g>
  );
};
