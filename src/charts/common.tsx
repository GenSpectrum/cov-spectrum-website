import React from 'react';
import styled from 'styled-components';
import { globalDateCache } from '../helpers/date-cache';

export const colors = {
  active: '#2980b9',
  activeSecondary: '#3498db',
  inactive: '#bdc3c7',
  inactiveSecondary: '#ecf0f1',
  secondary: '#7f8c8d',
  secondaryLight: '#95a5a6',
  highlight: '#f39c12',
  highlight2: '#f1c40f',
  transparent: '#ffffff80',
  bright: '#F18805',
  bright2: '#E08A13',
  bright3: '#CF8B20',
  good: '#27ae60',
  good2: '#2ecc71',
  neutral: '#e67e22',
  bad: '#c0392b',
};

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const TitleWrapper = ({ children, id }: { children: React.ReactNode; id?: string }) => {
  return (
    <h3 id={id} className='my-0 pb-4 pr-10 pt-0 text-gray-500'>
      {children}
    </h3>
  );
};

export const ChartAndMetricsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

export const ChartWrapper = styled.div`
  flex-grow: 1;
  width: 100%;
`;

const getWeeklyTickText = (value: string, dataLength: number, activeIndex: number, index: number) => {
  // minDistanceBetweenTicks tries to avoid that the fixed ticks overlap with the tick of the active entry. This
  // seems to work good enough for now but a perfect implementation probably has to consider the width of the
  // plot.
  const minDistanceBetweenTicks = Math.ceil(dataLength / 10);
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
      line2: globalDateCache.getIsoWeek(value).firstDay.string.slice(2),
    };
  }
};

const getMonthlyTickText = (value: string, dataLength: number, activeIndex: number, index: number) => {
  // minDistanceBetweenTicks tries to avoid that the fixed ticks overlap with the tick of the active entry. This
  // seems to work good enough for now but a perfect implementation probably has to consider the width of the
  // plot.
  const minDistanceBetweenTicks = Math.ceil(dataLength / 10);
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

export type TimeTickProps = {
  x?: number;
  y?: number;
  stroke?: unknown;
  payload?: { value: string; index: number };
  currentValue: string;
  dataLength: number;
  unit: 'week' | 'month';
  activeColor?: string;
  inactiveColor?: string;
  onlyDisplayActive: boolean;
};

const shouldDisplay = (isActive: boolean, onlyDisplayActive: boolean) => {
  if (onlyDisplayActive) {
    return isActive;
  }
  return true;
};

const textBaseProperties = {
  x: 0,
  y: 0,
  dx: 0,
  textAnchor: 'middle',
};

const hasSameValue = (prev: TimeTickProps, next: TimeTickProps): boolean => {
  return prev.currentValue === next.currentValue;
};

//memoized based on whether it has same index
export const TimeTick = React.memo(
  ({
    x,
    y,
    payload,
    currentValue,
    onlyDisplayActive,
    unit,
    activeColor = colors.active,
    inactiveColor = colors.inactive,
  }: TimeTickProps): JSX.Element => {
    let content;
    if (!payload || !shouldDisplay(payload.value === currentValue, onlyDisplayActive)) {
      content = <></>;
    } else {
      const text =
        unit === 'week'
          ? {
              line1: 'Week ' + payload.value.slice(5),
              line2: globalDateCache.getIsoWeek(payload.value).firstDay.string.slice(2),
            }
          : { line1: payload.value };
      if (!text) {
        content = <></>;
      } else {
        content = (
          <>
            <text
              {...textBaseProperties}
              dy={10}
              fill={payload.value === currentValue ? activeColor : inactiveColor}
              fontWeight={payload.value === currentValue ? 'bold' : 'normal'}
            >
              {text.line1}
            </text>
            {unit === 'week' && (
              <text
                {...textBaseProperties}
                dy={30}
                fill={payload.value === currentValue ? activeColor : inactiveColor}
                fontWeight={payload.value === currentValue ? 'bold' : 'normal'}
              >
                {text.line2}
              </text>
            )}
          </>
        );
      }
    }
    return <g transform={`translate(${x},${y})`}>{content}</g>;
  },
  hasSameValue
);
