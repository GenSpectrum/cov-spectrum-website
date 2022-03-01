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
import { maxYAxis } from '../helpers/max-y-axis';

export type EstimatedCasesTimeEntry = {
  date: UnifiedDay;
  cases: number;
  sequenced: number;
  variantCount: number;
};

export type EstimatedCasesChartProps = {
  data: EstimatedCasesTimeEntry[];
};

export type EstimatedCasesPlotEntry = {
  date: Date;
  estimatedCases: number;
  estimatedCasesCI: [number, number];
  estimatedWildtypeCases: number;
};

export function formatDate(date: number) {
  const d = new Date(date);
  return dayjs(d).format('YYYY-MM-DD');
}

const CHART_MARGIN_RIGHT = 15;

export const EstimatedCasesChartInner = React.memo(
  ({ data }: EstimatedCasesChartProps): JSX.Element => {
    const [active, setActive] = useState<EstimatedCasesPlotEntry | undefined>(undefined);

    const {
      plotData,
      ticks,
      yMax,
    }: {
      plotData: EstimatedCasesPlotEntry[];
      ticks: number[];
      yMax: number;
    } = useMemo(() => calculatePlotData(data), [data]);

    const setDefaultActive = (plotData: EstimatedCasesPlotEntry[]) => {
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
                  <YAxis domain={[0, maxYAxis(yMax, yMax, 5)]} allowDataOverflow={true} scale='linear' />
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

export function calculatePlotData(data: EstimatedCasesTimeEntry[]) {
  const sortedData = [...data].sort((a, b) => (a.date.dayjs.isAfter(b.date.dayjs) ? 1 : -1));
  const smoothedData: EstimatedCasesTimeEntry[] = [];
  for (let i = 3; i < sortedData.length - 3; i++) {
    const window = [
      sortedData[i - 3],
      sortedData[i - 2],
      sortedData[i - 1],
      sortedData[i],
      sortedData[i + 1],
      sortedData[i + 2],
      sortedData[i + 3],
    ];
    const sum = (accumulator: number, currentValue: number) => accumulator + currentValue;
    smoothedData.push({
      date: sortedData[i].date,
      cases: window.map(d => d.cases).reduce(sum) / 7,
      sequenced: window.map(d => d.sequenced).reduce(sum) / 7,
      variantCount: window.map(d => d.variantCount).reduce(sum) / 7,
    });
  }

  const plotData: EstimatedCasesPlotEntry[] = [];
  for (let { date, cases, sequenced, variantCount } of smoothedData) {
    if (sequenced === 0) {
      plotData.push({
        date: date.dayjs.toDate(),
        estimatedCases: NaN,
        estimatedCasesCI: [NaN, NaN],
        estimatedWildtypeCases: NaN,
      });
    }
    const wilsonInterval = calculateWilsonInterval(variantCount, sequenced);
    // Math.max(..., 0) compensates for numerical inaccuracies which can lead to negative values.
    const estimatedCases = Math.round(Math.max(variantCount / sequenced, 0) * cases);
    plotData.push({
      date: date.dayjs.toDate(),
      estimatedCases,
      estimatedCasesCI: [
        Math.round(Math.max(wilsonInterval[0], 0) * cases),
        Math.round(Math.max(wilsonInterval[1], 0) * cases),
      ],
      estimatedWildtypeCases: Math.round(cases - estimatedCases),
    });
  }

  const ticks = getTicks(
    smoothedData.map(d => ({
      date: d.date.dayjs.toDate(),
    }))
  );

  // To avoid that big confidence intervals render the plot unreadable
  const yMax = Math.min(
    Math.max(...plotData.filter(d => !isNaN(d.estimatedCases)).map(d => d.estimatedCases * 1.5)),
    Math.max(...plotData.filter(d => !isNaN(d.estimatedCasesCI[1])).map(d => d.estimatedCasesCI[1]))
  );

  return { plotData, ticks, yMax };
}
