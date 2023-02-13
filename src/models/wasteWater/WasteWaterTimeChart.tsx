import React, { useState } from 'react';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from '../../widgets/common';
import Metric, { MetricsWrapper } from '../../widgets/Metrics';
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WasteWaterTimeEntry, WasteWaterTimeseriesSummaryDataset } from './types';
import { getTicks } from '../../helpers/ticks';
import { TooltipSideEffect } from '../../components/RechartsTooltip';

export function formatDate(date: number) {
  const d = new Date(date);
  return d.getDate() + '.' + (d.getMonth() + 1);
}

interface Props {
  data: WasteWaterTimeseriesSummaryDataset;
}

const CHART_MARGIN_RIGHT = 15;

export const WasteWaterTimeChart = React.memo(({ data }: Props): JSX.Element => {
  const [active, setActive] = useState<(Omit<WasteWaterTimeEntry, 'date'> & { date: number }) | undefined>(
    undefined
  );
  const plotData = [...data]
    .map(d => ({
      ...d,
      date: d.date.dayjs.valueOf(),
    }))
    .sort((a, b) => a.date - b.date);
  const endDate = plotData[plotData.length - 1].date;
  const ticks = getTicks(plotData.map(({ date }) => ({ date: new Date(date) }))); // TODO This does not seem efficient

  return (
    <Wrapper>
      <TitleWrapper>
        Estimated prevalence in wastewater samples
        {active !== undefined && (
          <>
            {' '}
            on <b>{formatDate(active.date)}</b>
          </>
        )}
      </TitleWrapper>
      <ChartAndMetricsWrapper>
        <ChartWrapper>
          <ResponsiveContainer>
            <ComposedChart data={plotData} margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: 0 }}>
              <XAxis
                dataKey='date'
                scale='time'
                type='number'
                tickFormatter={formatDate}
                domain={[(dataMin: any) => dataMin, () => endDate]}
                ticks={ticks}
              />
              <YAxis />
              <Tooltip
                active={false}
                content={tooltipProps => {
                  return (
                    <TooltipSideEffect
                      tooltipProps={tooltipProps}
                      sideEffect={tooltipProps => {
                        if (tooltipProps.active && tooltipProps.payload !== undefined) {
                          const newActive = tooltipProps.payload[0].payload;
                          if (active === undefined || active.date !== newActive.date) {
                            setActive(newActive);
                          }
                        }
                        if (!tooltipProps.active) {
                          setActive(undefined);
                        }
                      }}
                    />
                  );
                }}
              />
              <Area
                type='monotone'
                dataKey='proportionCI'
                fill={colors.activeSecondary}
                stroke='transparent'
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
            title='Confidence int.'
            color={colors.active}
            helpText='The 95% confidence interval'
            percent={false}
          />
        </MetricsWrapper>
      </ChartAndMetricsWrapper>
    </Wrapper>
  );
});

export default WasteWaterTimeChart;
