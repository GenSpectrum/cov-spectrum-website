import React, { useEffect, useState } from 'react';
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

interface PerTrueFalse<T> {
  true: T;
  false: T;
}

export interface GroupValue {
  label: string;
  subject: SubgroupValue;
  reference: SubgroupValue;
}

export interface SubgroupValue {
  count: PerTrueFalse<number>;
  proportion?: ValueWithConfidence;
}

export interface ValueWithConfidence {
  value: number;
  confidenceInterval: [number, number];
}

export interface TopLevelTexts {
  subject: PerTrueFalse<LeafTexts>;
}

export interface LeafTexts {
  title: string;
  helpText: string;
}

export type Props = {
  data: GroupValue[];
  total: { subject: SubgroupValue; reference: SubgroupValue };
  texts: TopLevelTexts;
  width: number;
  height: number;
  onClickHandler?: OnClickHandler;
};

export const GroupedProportionComparisonChart = React.memo(
  ({ data, total, texts, width, height, onClickHandler }: Props): JSX.Element => {
    const [currentData, setCurrentData] = useState<GroupValue | undefined>();

    useEffect(() => {
      setCurrentData(undefined);
    }, [data]);

    const handleMouseEnter = (context: unknown, index: number): void => {
      setCurrentData(data[index]);
    };

    const handleClick = (context: unknown, index: number): void => {
      if (onClickHandler) {
        onClickHandler(index);
      }
    };

    const handleMouseLeave = (): void => {
      setCurrentData(undefined);
    };

    const makeScatterData = (side: 'subject' | 'reference', fill: { active: string; inactive: string }) =>
      data
        .filter(({ [side]: sideData }) => sideData.proportion !== undefined)
        .map(entry => {
          const { label, [side]: sideData } = entry;
          return { label, proportion: sideData.proportion!, isActive: entry === currentData || !currentData };
        })
        .map(({ label, proportion, isActive }) => ({
          label,
          y: proportion.value,
          [isActive ? 'yErrorActive' : 'yErrorInactive']: proportion.confidenceInterval.map(v =>
            Math.abs(proportion.value - v)
          ),
          fill: isActive ? fill.active : fill.inactive,
          stroke: isActive ? fill.active : fill.inactive,
        }));

    const metricData = currentData || total;

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
                data={makeScatterData('reference', { active: colors.secondary, inactive: colors.inactive })}
                fill={colors.secondary}
                shape={ScatterBarShape}
                onMouseEnter={handleMouseEnter}
                onClick={handleClick}
                isAnimationActive={false}
              />
              <Scatter
                data={makeScatterData('subject', { active: colors.active, inactive: colors.inactive })}
                onMouseEnter={handleMouseEnter}
                onClick={handleClick}
                isAnimationActive={false}
              >
                <ErrorBar direction='y' dataKey='yErrorActive' stroke={colors.active} />
                <ErrorBar direction='y' dataKey='yErrorInactive' stroke={colors.inactive} />
              </Scatter>
            </ScatterChart>
          </ChartWrapper>
          <MetricsWrapper>
            <MetricsSpacing />
            <Metric
              value={metricData.subject.count.true}
              title={texts.subject.true.title}
              color={colors.active}
              helpText={texts.subject.true.helpText}
            />
            <Metric
              value={metricData.subject.count.false}
              title={texts.subject.false.title}
              color={colors.active}
              helpText={texts.subject.false.helpText}
            />
          </MetricsWrapper>
        </ChartAndMetricsWrapper>
      </Wrapper>
    );
  }
);
