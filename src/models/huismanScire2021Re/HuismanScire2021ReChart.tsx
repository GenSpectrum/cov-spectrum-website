import { HuismanScire2021ReResult } from './types';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from '../../widgets/common';
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Metric, { MetricsWrapper } from '../../widgets/Metrics';
import React, { useMemo, useState } from 'react';
import { formatDate } from '../../widgets/VariantTimeDistributionLineChartInner';
import { maxYAxis } from '../../helpers/max-y-axis';
import { getTicks } from '../../helpers/ticks';
import { TooltipSideEffect } from '../../widgets/Tooltip';

type Props = {
  data: HuismanScire2021ReResult;
};

type PlotEntry = {
  date: Date;
  re: number;
  reCI: [number, number];
};

export const HuismanScire2021ReChart = ({ data }: Props) => {
  const [active, setActive] = useState<PlotEntry | undefined>(undefined);

  const { plotData, yMax, ticks } = useMemo(() => {
    const plotData = data.map(({ date, re, reLow, reHigh }) => ({
      date: date.dayjs.toDate(),
      re,
      reCI: [reLow, reHigh],
    }));

    const ticks = getTicks(plotData);

    const yMax = Math.min(
      Math.max(...plotData.filter(d => !isNaN(d.re)).map(d => d.re * 1.5)),
      Math.max(...plotData.filter(d => !isNaN(d.reCI[1])).map(d => d.reCI[1]))
    );

    return { plotData, yMax, ticks };
  }, [data]);

  return (
    <Wrapper>
      <TitleWrapper>
        <div>Estimated Re {active ? 'on ' + active.date.toISOString().substring(0, 10) : ''}</div>
      </TitleWrapper>
      <ChartAndMetricsWrapper>
        <ChartWrapper>
          <ResponsiveContainer>
            <ComposedChart data={plotData} margin={{ top: 6, right: 15, left: 0, bottom: 0 }}>
              <XAxis
                dataKey='date'
                scale='time'
                type='number'
                tickFormatter={formatDate}
                domain={[(dataMin: any) => dataMin, () => plotData[plotData.length - 1].date.getTime()]}
                ticks={ticks}
              />
              <YAxis
                allowDecimals={true}
                hide={false}
                width={50}
                domain={[0, maxYAxis(yMax)]}
                allowDataOverflow={true}
                scale='linear'
              />
              <Tooltip
                active={false}
                content={tooltipProps => {
                  return (
                    <TooltipSideEffect
                      tooltipProps={tooltipProps}
                      sideEffect={tooltipProps => {
                        if (tooltipProps.active && tooltipProps.payload !== undefined) {
                          const newActive = tooltipProps.payload[0].payload;
                          if (active === undefined || active.date.getTime() !== newActive.date.getTime()) {
                            setActive(newActive);
                          }
                        }
                      }}
                    />
                  );
                }}
              />
              <Area
                type='monotone'
                dataKey='reCI'
                fill={colors.activeSecondary}
                stroke='transparent'
                isAnimationActive={false}
              />
              <Line
                type='monotone'
                dataKey='re'
                stroke={colors.active}
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
              <ReferenceLine y={1} isFront={true} strokeWidth={2} stroke='darkgrey' strokeDasharray='3 3' />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartWrapper>
        <MetricsWrapper>
          <Metric
            value={active?.re.toFixed(2) ?? '-'}
            title='Re'
            color={colors.active}
            helpText={''}
            percent={false}
          />
          <Metric
            value={active ? `${active.reCI[0].toFixed(2)} - ${active.reCI[1].toFixed(2)}` : '-'}
            title='HPD'
            color={colors.secondary}
            helpText=''
            percent={false}
          />
        </MetricsWrapper>
      </ChartAndMetricsWrapper>
    </Wrapper>
  );
};
