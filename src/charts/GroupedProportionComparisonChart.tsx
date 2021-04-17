import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarProps,
  CartesianGrid,
  ComposedChart,
  ErrorBar,
  Scatter,
  ScatterProps,
  XAxis,
  YAxis,
} from 'recharts';
import styled from 'styled-components';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from './common';
import Metric, { MetricsSpacing, MetricsWrapper, METRIC_RIGHT_PADDING_PX, METRIC_WIDTH_PX } from './Metrics';
import { ScatterLegendItem, ScatterLegend } from './ScatterLegend';

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
  const width = 24;
  const height = 7;
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${width / 2}, ${height / 2})`}>
      <polygon points='-1,0 0,1 1,0 0,-1' fill={fill} />
    </g>
  );
};

export interface PerTrueFalse<T> {
  true: T;
  false: T;
}

const ExtendedScatterLegendWrapper = styled.div`
  margin-bottom: 10px;
`;

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
  subject: SubgroupTexts;
  reference: SubgroupTexts;
}

export interface SubgroupTexts extends PerTrueFalse<LeafTexts> {
  legend: string;
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
  extendedMetrics?: boolean;
  onClickHandler?: OnClickHandler;
};

export const GroupedProportionComparisonChart = React.memo(
  ({ data, total, texts, width, height, extendedMetrics, onClickHandler }: Props): JSX.Element => {
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

    // HACK Render transparent "bars" in the chart so that hovers
    // work anywhere, instead of only exactly on the scatter markers
    const hoverBarData = data.map(({ label }) => ({ label, y: 1 }));

    const metricData = currentData || total;

    const commonProps: Partial<Omit<BarProps & ScatterProps, 'ref'>> = {
      onMouseEnter: handleMouseEnter,
      onClick: handleClick,
      cursor: onClickHandler && 'pointer',
      isAnimationActive: false,
    };

    const subjectErrorBarSizes = {
      strokeWidth: 2,
      width: 8,
    };
    const referenceErrorBarSizes = {
      strokeWidth: 9,
      width: 0,
    };

    const subjectLegendItem: ScatterLegendItem = {
      ...subjectErrorBarSizes,
      name: texts.subject.legend,
      color: colors.active,
      textColor: colors.active,
      shape: ({ r, fill }) => <circle r={r} fill={fill} />,
    };
    const referenceLegendItem: ScatterLegendItem = {
      ...referenceErrorBarSizes,
      name: texts.reference.legend,
      color: colors.inactive,
      textColor: colors.secondary,
      shape: ScatterBarShape,
    };

    return (
      <Wrapper>
        <ChartAndMetricsWrapper>
          <ChartWrapper>
            <ComposedChart
              width={width - (extendedMetrics ? 2 : 1) * METRIC_WIDTH_PX - METRIC_RIGHT_PADDING_PX}
              height={height}
              margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
              onMouseLeave={handleMouseLeave}
              data={hoverBarData}
              barCategoryGap='0%'
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
                axisLine={false}
                tickLine={false}
                domain={[0, (dataMax: number) => Math.min(1, Math.ceil(dataMax * 10) / 10)]}
                scale='linear'
                tickFormatter={v => `${(v * 100).toFixed(0)}%`}
              />
              <CartesianGrid vertical={false} />
              <Bar {...commonProps} dataKey='y' fill='transparent' />
              <Scatter
                {...commonProps}
                data={makeScatterData('reference', { active: colors.inactive, inactive: colors.inactive })}
                shape={ScatterBarShape}
              >
                <ErrorBar
                  direction='y'
                  dataKey='yErrorActive'
                  stroke={colors.inactive}
                  {...referenceErrorBarSizes}
                />
                <ErrorBar
                  direction='y'
                  dataKey='yErrorInactive'
                  stroke={colors.inactive}
                  {...referenceErrorBarSizes}
                />
              </Scatter>
              <Scatter
                {...commonProps}
                data={makeScatterData('subject', { active: colors.active, inactive: colors.inactive })}
              >
                <ErrorBar
                  direction='y'
                  dataKey='yErrorActive'
                  stroke={colors.active}
                  {...subjectErrorBarSizes}
                />
                <ErrorBar
                  direction='y'
                  dataKey='yErrorInactive'
                  stroke={colors.inactive}
                  {...subjectErrorBarSizes}
                />
              </Scatter>
            </ComposedChart>
          </ChartWrapper>
          <MetricsWrapper>
            {extendedMetrics ? (
              <>
                <MetricsSpacing />
                <ExtendedScatterLegendWrapper>
                  <ScatterLegend items={[subjectLegendItem]} />
                </ExtendedScatterLegendWrapper>
              </>
            ) : (
              <>
                <ScatterLegend items={[subjectLegendItem, referenceLegendItem]} />
                <MetricsSpacing />
              </>
            )}
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
          {extendedMetrics && (
            <MetricsWrapper>
              <MetricsSpacing />
              <ExtendedScatterLegendWrapper>
                <ScatterLegend items={[referenceLegendItem]} />
              </ExtendedScatterLegendWrapper>
              <Metric
                value={metricData.reference.count.true}
                title={texts.reference.true.title}
                color={colors.secondary}
                helpText={texts.reference.true.helpText}
              />
              <Metric
                value={metricData.reference.count.false}
                title={texts.reference.false.title}
                color={colors.secondary}
                helpText={texts.reference.false.helpText}
              />
            </MetricsWrapper>
          )}
        </ChartAndMetricsWrapper>
      </Wrapper>
    );
  }
);
