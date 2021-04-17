import React, { useState } from 'react';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from './common';
import Metric, { MetricsSpacing, MetricsWrapper } from './Metrics';
import { Area, ComposedChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const dateFormatter = (date: number) => {
  const d = new Date(date);
  return d.getDate() + '.' + (d.getMonth() + 1);
};

type WasteWaterTimeEntry = {
  date: Date;
  proportion: number;
  proportionCI: [number, number];
};

export const WasteWaterTimeChart = React.memo(
  (): JSX.Element => {
    const data: WasteWaterTimeEntry[] = [
      {
        date: new Date('2021-01-15'),
        proportion: 0.41,
        proportionCI: [0.25, 0.49],
      },
      {
        date: new Date('2021-01-19'),
        proportion: 0.43,
        proportionCI: [0.35, 0.51],
      },
      {
        date: new Date('2021-01-23'),
        proportion: 0.82,
        proportionCI: [0.65, 0.99],
      },
      {
        date: new Date('2021-01-31'),
        proportion: 0.62,
        proportionCI: [0.58, 0.66],
      },
      {
        date: new Date('2021-02-30'),
        proportion: 0.54,
        proportionCI: [0.41, 0.67],
      },
    ];

    const [active, setActive] = useState<WasteWaterTimeEntry | undefined>(undefined);

    const endDate = new Date('2021-02-30');
    const ticks = [
      new Date('2021-01-01').getTime(),
      new Date('2021-02-01').getTime(),
      new Date('2021-03-01').getTime(),
    ];

    return (
      <Wrapper>
        <TitleWrapper>
          Estimated prevalence in waste water samples
          {active !== undefined ? ' on ' + dateFormatter(active.date.getTime()) : ''}
        </TitleWrapper>
        <ChartAndMetricsWrapper>
          <ChartWrapper>
            <ResponsiveContainer>
              <ComposedChart data={data}>
                <XAxis
                  dataKey='date'
                  scale='time'
                  type='number'
                  tickFormatter={dateFormatter}
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
                />
                <Line
                  type='monotone'
                  dataKey='proportion'
                  stroke={colors.active}
                  strokeWidth={3}
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
                  ? (active.proportionCI[0] * 100).toFixed(2) +
                    '-' +
                    (active.proportionCI[1] * 100).toFixed(2) +
                    '%'
                  : 'NA'
              }
              title='Confidence interval'
              color={colors.active}
              helpText='The 95% confidence interval'
              percent={false}
            />
            <MetricsSpacing />
          </MetricsWrapper>
        </ChartAndMetricsWrapper>
      </Wrapper>
    );
  }
);
