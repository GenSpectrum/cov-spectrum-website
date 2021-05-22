import styled from 'styled-components';
import { globalDateCache } from '../helpers/date-cache';

export const colors = {
  active: '#2980b9',
  activeSecondary: '#3498db',
  inactive: '#bdc3c7',
  inactiveSecondary: '#ecf0f1',
  secondary: '#7f8c8d',
  secondaryLight: '#95a5a6',
  highlight: '#c0392b',
  highlight2: '#e74c3c',
  transparent: '#ffffff80',
};

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
export const TitleWrapper = styled.div`
  padding: 0rem 0rem 1rem 0rem;
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
  // minDistanceBetweenTicks tries to avoid that the fixed ticks overlap with the tick of the active entry. This
  // seems to work good enough for now but a perfect implementation probably has to consider the width of the
  // plot.
  const minDistanceBetweenTicks = Math.ceil(dataLength / 15);
  if (activeIndex !== index && Math.abs(activeIndex - index) <= minDistanceBetweenTicks) {
    return undefined;
  }
  if (
    index === activeIndex ||
    index === 0 ||
    index === dataLength - 1 ||
    index === Math.floor(dataLength / 2)
  ) {
    return {
      line1: 'Week ' + value.slice(5),
      line2: globalDateCache.getIsoWeek(value).firstDay.string,
    };
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
  const text = payload ? getTimeTickText(payload.value, dataLength, activeIndex, payload.index) : undefined;
  if (!payload || !text) {
    return <g transform={`translate(${x},${y})`} />;
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={0}
        dy={10}
        textAnchor='middle'
        fill={payload.value === currentValue ? colors.active : colors.inactive}
      >
        {text.line1}
      </text>
      <text
        x={0}
        y={0}
        dx={0}
        dy={30}
        textAnchor='middle'
        fill={payload.value === currentValue ? colors.active : colors.inactive}
      >
        {text.line2}
      </text>
    </g>
  );
};
