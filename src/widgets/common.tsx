import React from 'react';
import styled from 'styled-components';
import { globalDateCache } from '../helpers/date-cache';
import chroma from 'chroma-js';

export const colors = {
  active: '#1F407A',
  activeSecondary: chroma('#273c75').brighten(2).hex(),
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
  //flex-grow: 1;
  width: 70%;
`;

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
              line2: globalDateCache.getIsoWeek(payload.value).firstDay.string,
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
            {unit === 'week' && onlyDisplayActive && (
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
