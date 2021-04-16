import React, { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, ErrorBar, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';
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

interface ScatterBarShapeProps {
  cx: number;
  cy: number;
  fill?: string;
}

const ScatterBarShape = ({ cx, cy, fill }: ScatterBarShapeProps) => {
  const width = 18;
  const height = 6;
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${width / 2}, ${height / 2})`}>
      <polygon points='-1,0 0,1 1,0 0,-1' fill={fill} />
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
        .filter(({ [side]: sideData }) => sideData.proportion !== undefined)
        .map(({ label, [side]: sideData }) => ({ label, proportion: sideData.proportion! }))
        .map(({ label, proportion }, i) => ({
          label,
          y: proportion.value,
          yError: proportion.confidenceInterval.map(v => Math.abs(proportion.value - v)),
        }));

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
              <YAxis
                dataKey='y'
                domain={[0, (dataMax: number) => Math.min(1, Math.ceil(dataMax * 10) / 10)]}
                scale='linear'
              />
              <CartesianGrid vertical={false} />
              <Scatter
                data={makeScatterData('right')}
                fill={colors.secondary}
                shape={ScatterBarShape}
                onMouseEnter={handleMouseEnter}
                onClick={handleClick}
                isAnimationActive={false}
              />
              <Scatter
                data={makeScatterData('left')}
                fill={colors.active}
                onMouseEnter={handleMouseEnter}
                onClick={handleClick}
                isAnimationActive={false}
              >
                <ErrorBar direction='y' dataKey='yError' stroke={colors.active} />
              </Scatter>
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
