import React from 'react';
import { Card } from 'react-bootstrap';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import { mean } from '../../helpers/lodash_alternatives';
import { colors } from '../../widgets/common';
import { CollectionVariant } from '../../data/Collection';
import { useDrag } from 'react-dnd';

const TREND_START = 9;
const TREND_END = 3;

interface Props {
  variant: CollectionVariant;
  chartData?: number[];
  recentProportion?: number;
  selected?: boolean;
  onClick: () => void;
}

const StyledCard = styled.div`
  overflow: hidden;
  cursor: pointer;
  user-select: none;
`;

enum TREND {
  POSITIVE = 1,
  NEUTRAL = 0,
  NEGATIVE = -1,
}

const getTrend = (data: number[]): TREND => {
  const middle = mean(
    data.slice(Math.max(data.length - TREND_START, 0), Math.max(data.length - TREND_END, 1))
  );
  const final = mean(data.slice(Math.max(data.length - TREND_END, 0)));
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
  switch (getTrend(data)) {
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

export const KnownVariantCard = ({ variant, chartData, recentProportion, onClick, selected }: Props) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'div',
    item: { query: variant.query },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div title={variant.description} ref={drag}>
      <Card
        as={StyledCard}
        className={`shadow-md border-0 m-0.5 hover:border-4 transition delay-20 duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl w-full`}
        onClick={onClick}
        selected={selected}
      >
        <div
          id='variant-title'
          className={`${
            selected ? 'font-bold' : ''
          } mx-2 mt-2 flex flex-row flex-nowrap items-end space-between`}
        >
          <div className='flex flex-row items-end flex-grow-1 overflow-hidden'>{variant.name}</div>
          {chartData?.length && (
            <div className='text-muted float-right ml-2 md:ml-0.5'>
              <p>{(Math.round(recentProportion! * 100 * 10) / 10).toString()}%</p>
            </div>
          )}
        </div>
        <div>
          <SimpleAreaPlot data={chartData} selected={selected ? selected : false} />
        </div>
      </Card>
    </div>
  );
};
