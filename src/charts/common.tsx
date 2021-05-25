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
  bright: '#F18805',
  bright2: '#E08A13',
  bright3: '#CF8B20',
};

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const TitleWrapper = ({ children, id }: { children: React.ReactNode; id?: string }) => {
  return (
    <h3 id={id} className='my-0 pb-4 pt-0 text-gray-500'>
      {children}
    </h3>
  );
};

export const ChartAndMetricsWrapper = styled.div`
  display: flex;
  flex: 1;
`;

export const ChartWrapper = styled.div`
  flex-grow: 1;
  width: 10rem;
`;

const getWeeklyTickText = (value: string, dataLength: number, activeIndex: number, index: number) => {
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

const getMonthlyTickText = (value: string, dataLength: number, activeIndex: number, index: number) => {
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
  unit: 'week' | 'month';
};

export const CustomTimeTick = ({
  x,
  y,
  payload,
  activeIndex,
  dataLength,
  currentValue,
  unit,
}: CustomTimeTickProps): JSX.Element => {
  let content;
  if (!payload) {
    content = <></>;
  } else if (unit === 'week') {
    const text = getWeeklyTickText(payload.value, dataLength, activeIndex, payload.index);
    if (!text) {
      content = <></>;
    } else {
      content = (
        <>
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
        </>
      );
    }
  } else if (unit === 'month') {
    const text = getMonthlyTickText(payload.value, dataLength, activeIndex, payload.index);
    if (!text) {
      content = <></>;
    } else {
      content = (
        <>
          <text
            x={0}
            y={0}
            dx={0}
            dy={10}
            textAnchor='middle'
            fill={payload.value === currentValue ? colors.active : colors.inactive}
          >
            {text}
          </text>
        </>
      );
    }
  }
  return <g transform={`translate(${x},${y})`}>{content}</g>;
};
