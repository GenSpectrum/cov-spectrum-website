import React, { useEffect, useMemo, useState } from 'react';
import { UnifiedDay } from '../helpers/date-cache';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from './common';
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Metric, { MetricsWrapper } from './Metrics';
import { getTicks } from '../helpers/ticks';
import { calculateWilsonInterval } from '../helpers/wilson-interval';
import dayjs from 'dayjs';
import DownloadWrapper from './DownloadWrapper';
import { Alert, AlertVariant } from '../helpers/ui';

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
  return dayjs(d).format('YYYY-MM-DD');
}

const CHART_MARGIN_RIGHT = 15;

export const EstimatedCasesChart = React.memo(
  ({ data }: EstimatedCasesChartProps): JSX.Element => {
    const [active, setActive] = useState<PlotEntry | undefined>(undefined);

    const {
      plotData,
      ticks,
      yMax,
    }: {
      plotData: PlotEntry[];
      ticks: number[];
      yMax: number;
    } = useMemo(() => {
      // Only show the data after the variant was first identified
      const sortedData = [...data].sort((a, b) => (a.date.dayjs.isAfter(b.date.dayjs) ? 1 : -1));
      let filteredData: EstimatedCasesTimeEntry[] = sortedData.filter(
        d => d.variantCount > 0 && d.sequenced > 0
      );
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
        const wilsonInterval = calculateWilsonInterval(variantCount, sequenced);
        // Math.max(..., 0) compensates for numerical inaccuracies which can lead to negative values.
        plotData.push({
          date: date.dayjs.toDate(),
          estimatedCases: Math.max(variantCount / sequenced, 0) * cases,
          estimatedCasesCI: [Math.max(wilsonInterval[0], 0) * cases, Math.max(wilsonInterval[1], 0) * cases],
        });
      }

      const ticks = getTicks(
        smoothedData.map(d => ({
          date: d.date.dayjs.toDate(),
        }))
      );

      // To avoid that big confidence intervals render the plot unreadable
      const yMax = Math.min(
        Math.max(...plotData.map(d => d.estimatedCases * 3)),
        Math.max(...plotData.map(d => d.estimatedCasesCI[1]))
      );

      return { plotData, ticks, yMax };
    }, [data]);

    const setDefaultActive = (plotData: PlotEntry[]) => {
      if (plotData) {
        const defaultActive = plotData[plotData.length - 1];
        defaultActive !== undefined && setActive(defaultActive);
      }
    };

    useEffect(() => {
      setDefaultActive(plotData);
    }, [plotData]);

    const csvData = useMemo(() => {
      return plotData.map(({ date, estimatedCases, estimatedCasesCI }) => ({
        date: dayjs(date).format('YYYY-MM-DD'),
        estimatedCases: estimatedCases.toFixed(0),
        estimatedCasesCILower: estimatedCasesCI[0].toFixed(0),
        estimatedCasesCIUpper: estimatedCasesCI[1].toFixed(0),
      }));
    }, [plotData]);

    if (plotData.length === 0) {
      return <Alert variant={AlertVariant.INFO}>We do not have enough data for this plot.</Alert>;
    }

    return (
      <DownloadWrapper name='EstimatedCasesPlot' csvData={csvData}>
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
                    domain={[(dataMin: any) => dataMin, () => plotData[plotData.length - 1].date.getTime()]}
                    ticks={ticks}
                  />
                  <YAxis domain={[0, yMax]} allowDataOverflow={true} scale='linear' />
                  <Tooltip
                    active={false}
                    content={e => {
                      if (e.active && e.payload !== undefined) {
                        const newActive = e.payload[0].payload;
                        if (active === undefined || active.date.getTime() !== newActive.date.getTime()) {
                          setActive(newActive);
                        }
                      }
                      return <></>;
                    }}
                  />
                  <Area
                    type='monotone'
                    dataKey='estimatedCasesCI'
                    fill={colors.activeSecondary}
                    stroke='transparent'
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
                title='Confidence int.'
                color={colors.secondary}
                helpText='The 95% confidence interval'
                percent={false}
              />
            </MetricsWrapper>
          </ChartAndMetricsWrapper>
        </Wrapper>
      </DownloadWrapper>
    );
  }
);
