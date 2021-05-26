import React from 'react';
import { Card } from 'react-bootstrap';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import { mean } from 'lodash';
import { colors } from '../../charts/common';

interface Props {
  name: string;
  chartData?: number[];
  recentProportion?: number;
  selected?: boolean;
  onClick: () => void;
}

const Title = styled.div`
  margin: 5px 10px;
  font-size: 1rem;
`;

const Percentage = styled.span`
  float: right;
`;

const StyledCard = styled.div`
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease-in-out;
  /* &:hover {
    background-color: #e2e6ea !important;
  } */
`;

enum TREND {
  POSITIVE = 1,
  NEUTRAL = 0,
  NEGATIVE = -1,
}

const getTrend = (data: number[]): TREND => {
  const middle = mean(data.slice(Math.max(data.length - 8, 0), Math.max(data.length - 2, 1)));
  const final = mean(data.slice(Math.max(data.length - 2, 0)));
  const difference = final - middle;
  if (Math.abs(difference) < 0.015 * middle || Math.abs(difference) < 0.0001) {
    return TREND.NEUTRAL;
  } else if (difference > 0) {
    return TREND.POSITIVE;
  } else {
    return TREND.NEGATIVE;
  }
};

const getTrendColor = (data: number[]): string => {
  const trend = getTrend(data);
  switch (trend) {
    case TREND.POSITIVE:
      return colors.bad;
    case TREND.NEGATIVE:
      return colors.good;
    default:
      return colors.neutral;
  }
};

const SimpleAreaPlot = React.memo(
  ({ data, selected }: { data: number[] | undefined; selected?: boolean }) => {
    const trendColor = data ? getTrendColor(data) : 'purple';
    return (
      <ResponsiveContainer width='100%' height={50}>
        <AreaChart
          data={(data || []).map(y => ({ y }))}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
          style={{ pointerEvents: 'none' }}
        >
          <Area
            dataKey='y'
            type='basis'
            fill={trendColor}
            fillOpacity={selected ? 1 : 0}
            stroke={trendColor}
            strokeWidth='2px'
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
);

export const KnownVariantCard = ({ name, chartData, recentProportion, onClick, selected }: Props) => {
  return (
    <Card
      as={StyledCard}
      className={`shadow-md border-0 m-0.5 hover:border-4 transition delay-20 duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl`}
      onClick={onClick}
      selected={selected}
    >
      <Title className={`${selected ? 'font-bold' : ''}`}>
        {name}
        {chartData?.length && (
          <Percentage className='text-muted'>{(recentProportion! * 100).toFixed(1)}%</Percentage>
        )}
      </Title>
      <div>
        <SimpleAreaPlot data={chartData} selected={selected} />
      </div>
    </Card>
  );
};
