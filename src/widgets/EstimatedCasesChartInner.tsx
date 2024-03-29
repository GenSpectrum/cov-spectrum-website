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
import { PprettyRequest } from '../data/ppretty/ppretty-request';
import { TooltipSideEffect } from '../components/RechartsTooltip';
import { Checkbox, FormControlLabel } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';

export type EstimatedCasesTimeEntry = {
  date: UnifiedDay;
  cases: number;
  sequenced: number;
  variantCount: number;
};

export type EstimatedCasesChartProps = {
  data: EstimatedCasesTimeEntry[];
  pprettyMetadata?: {
    location: string;
    variant: string;
  };
};

export type EstimatedCasesPlotEntry = {
  date: Date;
  estimatedCases: number;
  estimatedCasesCI: [number, number];
  estimatedCasesForLogScale?: number;
  estimatedCasesCIForLogScale?: [number | undefined, number | undefined];
  estimatedWildtypeCases: number;
};

export function formatDate(date: number) {
  const d = new Date(date);
  return dayjs(d).format('YYYY-MM-DD');
}

const CHART_MARGIN_RIGHT = 15;

export const EstimatedCasesChartInner = React.memo(
  ({ data, pprettyMetadata }: EstimatedCasesChartProps): JSX.Element => {
    const [active, setActive] = useState<EstimatedCasesPlotEntry | undefined>(undefined);
    const [logScale, setLogScale] = useState<boolean>(false);

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

    const { csvData, pprettyRequest } = useMemo(() => {
      const csvData = plotData.map(({ date, estimatedCases, estimatedCasesCI }) => ({
        date: dayjs(date).format('YYYY-MM-DD'),
        estimatedCases: estimatedCases.toFixed(0),
        estimatedCasesCILower: estimatedCasesCI[0].toFixed(0),
        estimatedCasesCIUpper: estimatedCasesCI[1].toFixed(0),
      }));
      const pprettyRequest: PprettyRequest = {
        config: {
          plotName: 'estimated-cases',
          plotType: 'line',
        },
        metadata: pprettyMetadata,
        data: plotData.map(({ date, estimatedCases, estimatedCasesCI }) => ({
          date: dayjs(date).format('YYYY-MM-DD'),
          estimatedCases: estimatedCases,
          estimatedCasesCILow: estimatedCasesCI[0],
          estimatedCasesCIHigh: estimatedCasesCI[1],
        })),
      };
      return { csvData, pprettyRequest };
    }, [plotData, pprettyMetadata]);

    if (plotData.length === 0) {
      return <Alert variant={AlertVariant.INFO}>We do not have enough data for this plot.</Alert>;
    }

    return (
      <DownloadWrapper name='EstimatedCasesPlot' csvData={csvData} pprettyRequest={pprettyRequest}>
        <Wrapper>
          <TitleWrapper>
            Estimated absolute number of cases
            {active !== undefined && (
              <>
                {' '}
                on <b>{formatDate(active.date.getTime())}</b>
              </>
            )}
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={logScale} onChange={() => setLogScale(logScale => !logScale)} />}
                label='Log scale'
              />
            </FormGroup>
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
                  <YAxis
                    allowDataOverflow={true}
                    domain={logScale ? ['auto', 'auto'] : [0, maxYAxis(yMax)]}
                    scale={logScale ? 'log' : 'linear'}
                    hide={false}
                    width={50}
                  />
                  <Tooltip
                    active={false}
                    content={tooltipProps => {
                      return (
                        <TooltipSideEffect
                          tooltipProps={tooltipProps}
                          sideEffect={tooltipProps => {
                            if (tooltipProps.active && tooltipProps.payload !== undefined) {
                              if (
                                tooltipProps.payload[0] !== undefined &&
                                tooltipProps.payload[0].payload !== undefined
                              ) {
                                const newActive = tooltipProps.payload[0].payload;
                                if (
                                  active === undefined ||
                                  active.date.getTime() !== newActive.date.getTime()
                                ) {
                                  setActive(newActive);
                                }
                              }
                            }
                          }}
                        />
                      );
                    }}
                  />
                  <Area
                    type='monotone'
                    dataKey={logScale ? 'estimatedCasesCIForLogScale' : 'estimatedCasesCI'}
                    fill={colors.activeSecondary}
                    stroke='transparent'
                    isAnimationActive={false}
                  />
                  <Line
                    type='monotone'
                    dataKey={logScale ? 'estimatedCasesForLogScale' : 'estimatedCases'}
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
        estimatedCasesForLogScale: NaN,
        estimatedCasesCIForLogScale: [NaN, NaN],
        estimatedWildtypeCases: NaN,
      });
      continue;
    }
    const wilsonInterval = calculateWilsonInterval(variantCount, sequenced);
    // Math.max(..., 0) compensates for numerical inaccuracies which can lead to negative values.
    const estimatedCases = Math.round(Math.max(variantCount / sequenced, 0) * cases);

    const estimatedCasesCI: [number, number] = [
      Math.round(Math.max(wilsonInterval[0], 0) * cases),
      Math.round(Math.max(wilsonInterval[1], 0) * cases),
    ];

    plotData.push({
      date: date.dayjs.toDate(),
      estimatedCases,
      estimatedCasesCI: estimatedCasesCI,
      estimatedCasesForLogScale: estimatedCases || undefined,
      estimatedCasesCIForLogScale: getEstimatedCasesCIForLogScale(estimatedCases, estimatedCasesCI),
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

const SMALL_NUMBER_TO_PREVENT_LOG_OF_0 = 0.1;

function getEstimatedCasesCIForLogScale(estimatedCases: number, [lowerBound, upperBound]: [number, number]) {
  if (!estimatedCases) {
    return undefined;
  }
  return [Math.max(lowerBound, SMALL_NUMBER_TO_PREVENT_LOG_OF_0), upperBound] as [number, number];
}
