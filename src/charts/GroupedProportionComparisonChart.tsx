import React, { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from './common';
import Metric, { MetricsSpacing, MetricsWrapper, METRIC_RIGHT_PADDING_PX, METRIC_WIDTH_PX } from './Metrics';

export type OnClickHandler = (index: number) => void;

type CustomTickProps = {
  x?: number;
  y?: number;
  stroke?: unknown;
  payload?: { value: string; index: number };
  currentValue?: string;
};

const CustomTick = ({ x, y, payload, currentValue }: CustomTickProps): JSX.Element => {
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
          {payload.value}
        </text>
      ) : (
        <></>
      )}
    </g>
  );
};

export interface GroupValue {
  label: string;
  left: SubgroupValue;
  right: SubgroupValue;
}

export interface SubgroupValue {
  countTrue: number;
  countFalse: number;
  proportion?: ValueWithConfidence;
}

export interface ValueWithConfidence {
  value: number;
  confidenceInterval: [number, number];
}

export type Props = {
  data: GroupValue[];
  width: number;
  height: number;
  onClickHandler?: OnClickHandler;
};

export const GroupedProportionComparisonChart = React.memo(
  ({ data, width, height, onClickHandler }: Props): JSX.Element => {
    const [activeIndex, setActiveIndex] = useState<number>();
    const currentData = useMemo<GroupValue | undefined>(
      () => (activeIndex === undefined ? undefined : data[activeIndex]),
      [data, activeIndex]
    );

    useEffect(() => {
      setActiveIndex(undefined);
    }, [data]);

    const handleMouseEnter = (context: unknown, index: number): void => {
      setActiveIndex(index);
    };

    const handleClick = (context: unknown, index: number): void => {
      if (onClickHandler) {
        onClickHandler(index);
      }
    };

    const handleMouseLeave = (): void => {
      setActiveIndex(undefined);
    };

    const makeScatterData = (side: 'left' | 'right') =>
      data
        .map(({ label, [side]: sideData }, i) => ({
          label,
          y: sideData.proportion?.value,
        }))
        .filter(({ y }) => y !== undefined);

    return (
      <Wrapper>
        <ChartAndMetricsWrapper>
          <ChartWrapper>
            <ScatterChart
              width={width - METRIC_WIDTH_PX - METRIC_RIGHT_PADDING_PX}
              height={height}
              margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
              onMouseLeave={handleMouseLeave}
            >
              <XAxis
                dataKey='label'
                allowDuplicatedCategory={false}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={<CustomTick currentValue={currentData?.label} />}
              />
              <YAxis dataKey='y' />
              <CartesianGrid vertical={false} />
              <Scatter
                data={makeScatterData('left')}
                fill='#8884d8'
                onMouseEnter={handleMouseEnter}
                onClick={handleClick}
                isAnimationActive={false}
              />
              <Scatter
                data={makeScatterData('right')}
                fill='red'
                onMouseEnter={handleMouseEnter}
                onClick={handleClick}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ChartWrapper>
          <MetricsWrapper>
            <MetricsSpacing />
            <Metric
              value={5}
              title='Proportion'
              color={colors.active}
              helpText='Proportion relative to all samples collected from this age group.'
              percent={true}
            />
          </MetricsWrapper>
        </ChartAndMetricsWrapper>
      </Wrapper>
    );
  }
);
