import React, { useState } from 'react';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from '../../charts/common';
import Metric, { MetricsSpacing, MetricsWrapper } from '../../charts/Metrics';
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WasteWaterTimeEntry, WasteWaterTimeseriesSummaryDataset } from './types';
import { getTicks } from '../../helpers/ticks';

export function formatDate(date: number) {
  const d = new Date(date);
  return d.getDate() + '.' + (d.getMonth() + 1);
}

interface Props {
  data: WasteWaterTimeseriesSummaryDataset;
}

const CHART_MARGIN_RIGHT = 15;

export const WasteWaterTimeChart = React.memo(
  ({ data }: Props): JSX.Element => {
    const [active, setActive] = useState<WasteWaterTimeEntry | undefined>(undefined);
    data = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
    const endDate = data[data.length - 1].date;
    const ticks = getTicks(data);

    return (
      <Wrapper>
        <TitleWrapper>
          Estimated prevalence in waste water samples
          {active !== undefined && (
            <>
              {' '}
              on <b>{formatDate(active.date.getTime())}</b>
            </>
          )}
        </TitleWrapper>
        <ChartAndMetricsWrapper>
          <ChartWrapper>
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey='date'
                  scale='time'
                  type='number'
                  tickFormatter={formatDate}
                  domain={[(dataMin: any) => dataMin, () => endDate.getTime()]}
                  ticks={ticks}
                />
                <YAxis />
                <Tooltip
                  active={false}
                  content={e => {
                    if (e.active && e.payload !== undefined) {
                      const newActive = e.payload[0].payload;
                      if (active === undefined || active.date.getTime() !== newActive.date.getTime()) {
                        setActive(newActive);
                      }
                    }
                    if (!e.active) {
                      setActive(undefined);
                    }
                    return <></>;
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='proportionCI'
                  fill={colors.secondaryLight}
                  stroke={colors.secondary}
                  isAnimationActive={false}
                />
                <Line
                  type='monotone'
                  dataKey='proportion'
                  stroke={colors.active}
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <MetricsWrapper>
            <MetricsSpacing />
            <Metric
              value={active !== undefined ? (active.proportion * 100).toFixed(2) + '%' : 'NA'}
              title='Proportion'
              color={colors.active}
              helpText='Estimated proportion relative to all samples collected.'
              percent={false}
            />
            <Metric
              value={
                active !== undefined
                  ? Math.round(active.proportionCI[0] * 100) +
                    '-' +
                    Math.round(active.proportionCI[1] * 100) +
                    '%'
                  : 'NA'
              }
              title='Confidence interval'
              color={colors.active}
              helpText='The 95% confidence interval'
              percent={false}
            />
          </MetricsWrapper>
        </ChartAndMetricsWrapper>
      </Wrapper>
    );
  }
);

export default WasteWaterTimeChart;
