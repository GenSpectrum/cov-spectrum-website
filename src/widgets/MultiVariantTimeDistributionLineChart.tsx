import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { UnifiedDay } from '../helpers/date-cache';
import { fillAndFilterFromDailyMap } from '../helpers/fill-missing';
import { ChartAndMetricsWrapper, ChartWrapper, Wrapper } from './common';
import { ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import React from 'react';
import chroma from 'chroma-js';
import { getTicks } from '../helpers/ticks';
import { calculateWilsonInterval } from '../helpers/wilson-interval';
import { formatVariantDisplayName } from '../data/VariantSelector';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { formatDate } from './VariantTimeDistributionLineChartInner';
import { AnalysisMode } from '../data/AnalysisMode';

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
        pd[`variantName${i}`] = formatVariantDisplayName(variantSampleSets[i].selector.variant!);
      }
      return pd;
    });

    // ticks
    const ticks = getTicks(plotData);

    return { plotData, ticks };
  }, [variantSampleSets, wholeSampleSet.payload, wholeSampleSet.selector.dateRange]);

  // rendering
  return (
    <Wrapper>
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
                xAxisId='date'
              />
              <YAxis
                tickFormatter={tick => `${tick * 100}%`}
                yAxisId='variant-proportion'
                scale='auto'
                domain={[0, 'auto']}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const index = Number.parseInt(name.replaceAll('variantProportion', ''));
                  const payload = props.payload;
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
                }}
                labelFormatter={label => 'Date: ' + formatDateToWindow(label)}
              />
              {variantSampleSets.map((_, index) => {
                const lineColor = chroma.random().darken().hex();
                return (
                  <Line
                    yAxisId='variant-proportion'
                    xAxisId='date'
                    type='monotone'
                    dataKey={`variantProportion${index}`}
                    strokeWidth={3}
                    stroke={lineColor}
                    dot={false}
                    isAnimationActive={false}
                    key={index}
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
