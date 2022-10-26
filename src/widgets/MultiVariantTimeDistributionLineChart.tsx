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
import { Checkbox, FormGroup } from '@mui/material';

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
  const [log, setLog] = useState<boolean>(false);

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
        // select only those values which are greater than zero for the log scale
        pd[`variantProportionLog${i}`] = proportion !== 0 ? proportion : undefined;

        const wilsonInterval = calculateWilsonInterval(variantCount, d.sequenced);

        pd[`variantProportionCILower${i}`] = Math.max(wilsonInterval[0], 0);
        pd[`variantProportionCIUpper${i}`] = Math.max(wilsonInterval[1], 0);
        pd[`CI${i}`] = [Math.max(wilsonInterval[0], 0), Math.max(wilsonInterval[1], 0)];

        if (pd[`variantProportionLog${i}`]) {
          pd[`variantProportionCILowerLog${i}`] = pd[`variantProportionCILower${i}`];
          pd[`variantProportionCIUpperLog${i}`] = pd[`variantProportionCIUpper${i}`];

          pd[`CIlog${i}`] = [pd[`variantProportionCILowerLog${i}`], pd[`variantProportionCIUpperLog${i}`]];
        }

        pd[`variantName${i}`] = formatVariantDisplayName(variantSampleSets[i].selector.variant!);
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

  return (
    <div style={{ height: '100%' }}>
      <FormGroup>
        <div className='flex-wrap mb-3 mt-2'>
          {analysisMode !== AnalysisMode.CompareToBaseline && (
            <>
              <Checkbox defaultChecked checked={showCI} onChange={() => setShowCI(!showCI)} size='small' />
              <span>Show CI</span>
            </>
          )}
          <Checkbox defaultChecked checked={log} onChange={() => setLog(!log)} size='small' />
          <span>Log Scale</span>
        </div>
      </FormGroup>

      <Wrapper>
        <ChartAndMetricsWrapper>
          <ChartWrapper>
            <ResponsiveContainer>
              <ComposedChart data={plotData} margin={{ top: 6, right: 15, left: 15, bottom: 20 }}>
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
                  tickFormatter={tick => `${Math.round(tick * 100 * 100) / 100}%`}
                  yAxisId='variant-proportion'
                  scale={log ? 'log' : 'auto'}
                  domain={log ? ['auto', 'auto'] : [0, yMax]}
                  allowDataOverflow
                />

                <Tooltip
                  formatter={(value: number, name: string, props: any) => {
                    const payload = props.payload;

                    if (!name.includes('Log')) {
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
                    } else {
                      const index = Number.parseInt(name.replaceAll('variantProportionLog', ''));
                      let logString =
                        payload[`variantProportionLog${index}`] !== undefined &&
                        (payload[`variantProportionLog${index}`] * 100).toFixed(2) + '%';

                      let logCIstring =
                        ' [' +
                        (payload[`variantProportionCILowerLog${index}`] * 100).toFixed(2) +
                        '%' +
                        ' - ' +
                        (payload[`variantProportionCIUpperLog${index}`] * 100).toFixed(2) +
                        '%' +
                        ' ]';

                      return [
                        logString + (analysisMode !== AnalysisMode.CompareToBaseline ? logCIstring : ''),
                        payload[`variantName${index}`],
                      ];
                    }
                  }}
                  labelFormatter={label => 'Date: ' + formatDateToWindow(label)}
                />

                {variantSampleSets.map((_, index) => {
                  return (
                    <Line
                      yAxisId='variant-proportion'
                      xAxisId='date'
                      type='monotone'
                      dataKey={log ? `variantProportionLog${index}` : `variantProportion${index}`}
                      strokeWidth={3}
                      stroke={colors[index]}
                      dot={false}
                      isAnimationActive={false}
                      key={index}
                    />
                  );
                })}

                {showCI &&
                  analysisMode !== AnalysisMode.CompareToBaseline &&
                  variantSampleSets.map((_, index) => {
                    return (
                      <Area
                        yAxisId='variant-proportion'
                        xAxisId='date'
                        type='monotone'
                        dataKey={log ? `CIlog${index}` : `CI${index}`}
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
    </div>
  );
};

function formatDateToWindow(date: number) {
  const d = dayjs(new Date(date));
  const dateRange = [d.subtract(3, 'day'), d.add(3, 'day')].map(d => d.format('YYYY-MM-DD'));
  return dateRange[0] + ' to ' + dateRange[1];
}
