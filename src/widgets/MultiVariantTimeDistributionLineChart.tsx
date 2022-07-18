import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { UnifiedDay } from '../helpers/date-cache';
import { fillAndFilterFromDailyMap } from '../helpers/fill-missing';
import { ChartAndMetricsWrapper, ChartWrapper, Wrapper } from './common';
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import React, { useState } from 'react';
import chroma from 'chroma-js';
import { getTicks } from '../helpers/ticks';
import { calculateWilsonInterval } from '../helpers/wilson-interval';
import { formatVariantDisplayName } from '../data/VariantSelector';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { formatDate } from './VariantTimeDistributionLineChartInner';
import { AnalysisMode } from '../data/AnalysisMode';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

function hexToRGB(hex: string, alpha: number) {
  let r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  if (alpha) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }
}

export type MultiVariantTimeDistributionLineChartProps = {
  variantSampleSets: DateCountSampleDataset[];
  wholeSampleSet: DateCountSampleDataset;
  analysisMode: AnalysisMode;
};

export const MultiVariantTimeDistributionLineChart = ({
  variantSampleSets,
  wholeSampleSet,
  analysisMode,
}: MultiVariantTimeDistributionLineChartProps) => {
  const [showCI, setShowCI] = useState<boolean>(true);
  const [logit, setLogit] = useState<boolean>(false);
  const { plotData, ticks } = useMemo(() => {
    // fill in dates with zero samples and merge sample sets
    const numberOfVariants = variantSampleSets.length;
    const dateMap: Map<UnifiedDay, any> = new Map();
    fillAndFilterFromDailyMap(
      new Map<UnifiedDay, null>(),
      null,
      wholeSampleSet.selector.dateRange!.getDateRange()
    ).forEach(({ key }) => {
      const entry: any = {
        date: key,
        sequenced: 0,
      };
      for (let i = 0; i < numberOfVariants; i++) {
        entry[`variantCount${i}`] = 0;
        entry[`variantProportion${i}`] = 0;
      }
      dateMap.set(key, entry);
    });
    for (let { date, count } of wholeSampleSet.payload) {
      if (!date || !dateMap.has(date)) {
        continue;
      }
      dateMap.get(date)!.sequenced = count;
    }
    for (let i = 0; i < numberOfVariants; i++) {
      const variantSampleSet = variantSampleSets[i];
      for (let { date, count } of variantSampleSet.payload) {
        if (!date || !dateMap.has(date)) {
          continue;
        }
        const entry = dateMap.get(date)!;
        entry[`variantCount${i}`] = count;
      }
    }

    // smoothing: compute 7-days average
    const proportionData = [...dateMap.values()];
    const sortedData = [...proportionData].sort((a, b) => (a.date.dayjs.isAfter(b.date.dayjs) ? 1 : -1));
    const smoothedData: any[] = [];
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
      const smoothedEntry: any = {
        date: sortedData[i].date,
        sequenced: window.map(d => d.sequenced).reduce(sum) / 7,
      };
      for (let j = 0; j < numberOfVariants; j++) {
        smoothedEntry[`variantCount${j}`] = window.map(d => d[`variantCount${j}`]).reduce(sum) / 7;
      }
      smoothedData.push(smoothedEntry);
    }

    // compute proportions
    const plotData = smoothedData.map(d => {
      const pd = {
        ...d,
        date: d.date.dayjs.toDate(),
      };

      for (let i = 0; i < numberOfVariants; i++) {
        const variantCount = d[`variantCount${i}`];
        let proportion = variantCount / d.sequenced;
        if (!Number.isFinite(proportion)) {
          proportion = NaN;
        }
        pd[`variantProportion${i}`] = proportion;
        const wilsonInterval = calculateWilsonInterval(variantCount, d.sequenced);
        pd[`variantProportionCILower${i}`] = Math.max(wilsonInterval[0], 0);
        pd[`variantProportionCIUpper${i}`] = Math.max(wilsonInterval[1], 0);
        pd[`CI${i}`] = [Math.max(wilsonInterval[0], 0), Math.max(wilsonInterval[1], 0)];
        pd[`variantName${i}`] = formatVariantDisplayName(variantSampleSets[i].selector.variant!);

        let logit = Math.log(proportion / (1 - proportion));

        pd[`logit${i}`] = logit === null || logit === -Infinity ? Number.MIN_SAFE_INTEGER : logit;

        let logitCILower = Math.log(Math.max(wilsonInterval[0], 0) / (1 - Math.max(wilsonInterval[0], 0)));
        pd[`logitCILower${i}`] =
          logitCILower === null || logitCILower === -Infinity ? Number.MIN_SAFE_INTEGER : logitCILower;

        pd[`logitCI${i}`] = [
          logitCILower === null || logitCILower === -Infinity ? Number.MIN_SAFE_INTEGER : logitCILower,
          Math.log(Math.max(wilsonInterval[1], 0) / (1 - Math.max(wilsonInterval[1], 0))),
        ];
        pd[`logitCIUpper${i}`] = Math.log(
          Math.max(wilsonInterval[1], 0) / (1 - Math.max(wilsonInterval[1], 0))
        );
      }

      return pd;
    });

    // ticks
    const ticks = getTicks(plotData);

    return { plotData, ticks };
  }, [variantSampleSets, wholeSampleSet.payload, wholeSampleSet.selector.dateRange]);

  function getYMax(pd: typeof plotData): number {
    let max = 0;
    for (let i = 0; i < variantSampleSets.length; i++) {
      for (let item of pd) {
        if (item[`variantProportion${i}`] > max) {
          max = Math.min(item[`variantProportion${i}`] * 1.5, item[`variantProportionCIUpper${i}`]);
        }
      }
    }

    return max;
  }

  const colors = variantSampleSets.map(() => chroma.random().darken().hex());
  const yMax: number = getYMax(plotData);

  function logitRound(n: number) {
    return ((n * 100) / 100).toFixed(2);
  }

  return (
    <Wrapper>
      {analysisMode !== AnalysisMode.CompareToBaseline && (
        <FormGroup>
          <FormControlLabel
            control={<Checkbox defaultChecked checked={showCI} onChange={() => setShowCI(!showCI)} />}
            label='Show CI'
          />
          <FormControlLabel
            control={<Checkbox defaultChecked checked={logit} onChange={() => setLogit(!logit)} />}
            label='Logit scale'
          />
        </FormGroup>
      )}

      <ChartAndMetricsWrapper>
        <ChartWrapper>
          <ResponsiveContainer>
            <ComposedChart data={plotData} margin={{ top: 6, right: 15, left: 15, bottom: 0 }}>
              <XAxis
                dataKey='date'
                scale='time'
                type='number'
                tickFormatter={formatDate}
                domain={[(dataMin: any) => dataMin, () => plotData[plotData.length - 1].date.getTime()]}
                ticks={ticks}
                xAxisId='date'
              />
              {!logit ? (
                <YAxis
                  tickFormatter={tick => `${Math.round(tick * 100 * 100) / 100}%`}
                  yAxisId='variant-proportion'
                  scale='auto'
                  domain={[0, yMax]}
                  allowDataOverflow
                />
              ) : (
                <YAxis
                  yAxisId='logit'
                  scale='auto'
                  tickFormatter={tick => `${Math.round(tick * 100) / 100}`}
                  domain={[-10, 10]}
                  allowDataOverflow
                />
              )}

              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const payload = props.payload;
                  if (name.includes('variantProportion')) {
                    const index = Number.parseInt(name.replaceAll('variantProportion', ''));
                    const proportionString = (payload[`variantProportion${index}`] * 100).toFixed(2) + '%';
                    const proportionCiString =
                      ' [' +
                      (payload[`variantProportionCILower${index}`] * 100).toFixed(2) +
                      '-' +
                      (payload[`variantProportionCIUpper${index}`] * 100).toFixed(2) +
                      '%]';

                    return [
                      // It does not make sense to show a CI (as it is calculated right now) if the chosen variants are
                      // not a subset of the baseline.
                      // TODO Do show the CI if a variant is a subset of the baseline
                      proportionString +
                        (analysisMode !== AnalysisMode.CompareToBaseline ? proportionCiString : ''),
                      payload[`variantName${index}`],
                    ];
                  }
                  if (name.includes('logit')) {
                    const index = Number.parseInt(name.replaceAll('logit', ''));

                    let logitString =
                      payload[`logit${index}`] === Number.MIN_SAFE_INTEGER
                        ? '-Infinity'
                        : logitRound(payload[`logit${index}`]);

                    let logitCIstring =
                      payload[`logitCILower${index}`] === Number.MIN_SAFE_INTEGER
                        ? ' [' + ' -Infinity' + ' - ' + logitRound(payload[`logitCIUpper${index}`]) + ' ]'
                        : ' [' +
                          logitRound(payload[`logitCILower${index}`]) +
                          ' - ' +
                          logitRound(payload[`logitCIUpper${index}`]) +
                          ' ]';

                    return [
                      logitString + (analysisMode !== AnalysisMode.CompareToBaseline ? logitCIstring : ''),
                      payload[`variantName${index}`],
                    ];
                  }
                  return [null, null];
                }}
                labelFormatter={label => 'Date: ' + formatDateToWindow(label)}
              />

              {variantSampleSets.map((_, index) => {
                return (
                  <Line
                    yAxisId={!logit ? 'variant-proportion' : 'logit'}
                    xAxisId='date'
                    type='monotone'
                    dataKey={!logit ? `variantProportion${index}` : `logit${index}`}
                    strokeWidth={3}
                    stroke={colors[index]}
                    dot={false}
                    isAnimationActive={false}
                    key={index}
                  />
                );
              })}

              {showCI &&
                variantSampleSets.map((_, index) => {
                  return (
                    <Area
                      yAxisId={!logit ? 'variant-proportion' : 'logit'}
                      xAxisId='date'
                      type='monotone'
                      dataKey={!logit ? `CI${index}` : `logitCI${index}`}
                      fill={hexToRGB(colors[index], 0.5)}
                      stroke='transparent'
                      isAnimationActive={false}
                      key={index + 10}
                    />
                  );
                })}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </ChartAndMetricsWrapper>
    </Wrapper>
  );
};

function formatDateToWindow(date: number) {
  const d = dayjs(new Date(date));
  const dateRange = [d.subtract(3, 'day'), d.add(3, 'day')].map(d => d.format('YYYY-MM-DD'));
  return dateRange[0] + ' to ' + dateRange[1];
}
