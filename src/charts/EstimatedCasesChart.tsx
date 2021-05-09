import React, { useMemo, useState } from 'react';
import { UnifiedDay } from '../helpers/date-cache';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from './common';
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Metric, { MetricsSpacing, MetricsWrapper } from './Metrics';
import { getTicks } from '../models/wasteWater/WasteWaterTimeChart';
import calculateWilsonInterval from 'wilson-interval';

export type EstimatedCasesTimeEntry = {
  date: UnifiedDay;
  cases: number;
  sequenced: number;
  variantCount: number;
};

export type EstimatedCasesChartProps = {
  data: EstimatedCasesTimeEntry[];
};

type PlotEntry = {
  date: Date;
  estimatedCases: number;
  estimatedCasesCI: [number, number];
};

export function formatDate(date: number) {
  const d = new Date(date);
  return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
}

const CHART_MARGIN_RIGHT = 15;

export const EstimatedCasesChart = React.memo(
  ({ data }: EstimatedCasesChartProps): JSX.Element => {
    const [active, setActive] = useState<PlotEntry | undefined>(undefined);

    const {
      plotData,
      ticks,
    }: {
      plotData: PlotEntry[];
      ticks: number[];
    } = useMemo(() => {
      // Only show the data after the variant was first identified
      const sortedData = [...data].sort((a, b) => (a.date.dayjs.isAfter(b.date.dayjs) ? 1 : -1));
      const filteredData: EstimatedCasesTimeEntry[] = [];
      let firstVariantFound = false;
      for (let d of sortedData) {
        if (!firstVariantFound) {
          if (d.variantCount > 0) {
            firstVariantFound = true;
          }
        }
        if (firstVariantFound) {
          filteredData.push(d);
        }
      }

      const smoothedData: EstimatedCasesTimeEntry[] = [];
      for (let i = 3; i < filteredData.length - 3; i++) {
        const window = [
          filteredData[i - 3],
          filteredData[i - 2],
          filteredData[i - 1],
          filteredData[i],
          filteredData[i + 1],
          filteredData[i + 2],
          filteredData[i + 3],
        ];
        const sum = (accumulator: number, currentValue: number) => accumulator + currentValue;
        smoothedData.push({
          date: filteredData[i].date,
          cases: window.map(d => d.cases).reduce(sum) / 7,
          sequenced: window.map(d => d.sequenced).reduce(sum) / 7,
          variantCount: window.map(d => d.variantCount).reduce(sum) / 7,
        });
      }

      const plotData: PlotEntry[] = [];
      for (let { date, cases, sequenced, variantCount } of smoothedData) {
        if (sequenced === 0) {
          continue;
        }
        const wilsonInterval = calculateWilsonInterval(variantCount, sequenced, false, {
          confidence: 0.95,
          precision: 10,
        });
        // Math.max(..., 0) compensates for numerical inaccuracies which can lead to negative values.
        plotData.push({
          date: date.dayjs.toDate(),
          estimatedCases: Math.max(variantCount / sequenced, 0) * cases,
          estimatedCasesCI: [
            Math.max(+wilsonInterval.low, 0) * cases,
            Math.max(+wilsonInterval.high, 0) * cases,
          ],
        });
      }
      const ticks = getTicks(
        smoothedData.map(d => ({
          date: d.date.dayjs.toDate(),
        }))
      );
      return { plotData, ticks };
    }, [data]);

    return (
      <Wrapper>
        <TitleWrapper>
          Estimated absolute number of cases
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
              <ComposedChart
                data={plotData}
                margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey='date'
                  scale='time'
                  type='number'
                  tickFormatter={formatDate}
                  domain={[
                    (dataMin: any) => dataMin,
                    () => data[data.length - 1].date.dayjs.toDate().getTime(),
                  ]}
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
                  dataKey='estimatedCasesCI'
                  fill={colors.secondaryLight}
                  stroke={colors.secondary}
                  isAnimationActive={false}
                />
                <Line
                  type='monotone'
                  dataKey='estimatedCases'
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
              value={active !== undefined ? active.estimatedCases.toFixed(0) : 'NA'}
              title='Est. cases'
              color={colors.active}
              helpText='The estimated proportion of the variant multiplied with the number of reported cases (smoothed with a 7-days sliding window)'
              percent={false}
            />
            <Metric
              value={
                active !== undefined
                  ? active.estimatedCasesCI[0].toFixed(0) + '-' + active.estimatedCasesCI[1].toFixed(0)
                  : 'NA'
              }
              fontSize='small'
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
