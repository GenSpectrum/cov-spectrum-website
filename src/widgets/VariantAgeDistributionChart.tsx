import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChartAndMetrics } from './Metrics';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { colors } from './common';
import { AgeCountSampleData, AgeCountSampleDataset } from '../data/sample/AgeCountSampleDataset';
import { fillFromPrimitiveMap, possibleAgeKeys } from '../helpers/fill-missing';
import { useResizeDetector } from 'react-resize-detector';
import DownloadWrapper from './DownloadWrapper';
import { maxYAxis } from '../helpers/max-y-axis';
import { SetCurrentDataSideEffect } from '../components/RechartsTooltip';

const CHART_MARGIN_RIGHT = 15;

export type OnClickHandler = (index: number) => boolean;

type CustomTickProps = {
  x?: number;
  y?: number;
  stroke?: unknown;
  payload?: { value: string; index: number };
  activeIndex?: number;
  dataLength?: number;
  currentValue: string;
};

const CustomTick = ({ x, y, payload, currentValue }: CustomTickProps): JSX.Element => {
  return (
    <g transform={`translate(${x},${y})`}>
      {payload ? (
        <text
          x={0}
          y={0}
          dx={0}
          dy={10}
          textAnchor='middle'
          fill={payload.value === currentValue ? colors.active : colors.inactive}
          fontWeight={payload.value === currentValue ? 'bold' : 'normal'}
        >
          {payload.value}
        </text>
      ) : (
        <></>
      )}
    </g>
  );
};

export type AgeEntry = {
  name: string;
  percent: number;
  quantity: number;
};

export type VariantAgeDistributionChartProps = {
  variantSampleSet: AgeCountSampleDataset;
  wholeSampleSet: AgeCountSampleDataset;
  onClickHandler?: OnClickHandler;
};

export const VariantAgeDistributionChart = React.memo(
  ({ variantSampleSet, wholeSampleSet, onClickHandler }: VariantAgeDistributionChartProps): JSX.Element => {
    const { width, ref } = useResizeDetector();
    const widthIsSmall = !!width && width < 700;

    const data = useMemo(() => {
      const proportionByAgeGroup = AgeCountSampleData.proportionByAgeGroup(
        variantSampleSet.payload,
        wholeSampleSet.payload
      );
      return fillFromPrimitiveMap(proportionByAgeGroup, possibleAgeKeys, {
        count: 0,
        proportion: 0,
      })
        .filter(({ key }) => key !== null)
        .map(({ key, value: { count, proportion } }) => ({
          name: widthIsSmall ? key!.replace(/-\d+$/, '-') : key!,
          quantity: count,
          percent: proportion === undefined ? 0 : 100 * proportion,
        }));
    }, [variantSampleSet, wholeSampleSet, widthIsSmall]);

    const csvData = useMemo(() => {
      return data.map(({ name, percent, quantity }) => ({
        ageGroup: name,
        numberSamples: quantity,
        proportionWithinAgeGroup: percent ? (percent / 100).toFixed(6) : undefined,
      }));
    }, [data]);

    const [ready, setReady] = useState(false);
    const [currentData, setCurrentData] = useState<AgeEntry>(data[data.length - 1]);

    useEffect(() => {
      setReady(true);
    }, []);

    const resetDefault = useCallback(() => {
      const maxIndex = data.reduce(
        (iMax: number, x: AgeEntry, i: number, arr: AgeEntry[]) =>
          x.percent >= arr[iMax].percent ? i : iMax,
        0
      );
      setCurrentData(data[maxIndex]);
    }, [data]);

    useEffect(() => {
      resetDefault();
    }, [data, resetDefault]);

    const handleMouseLeave = (): void => {
      resetDefault();
    };

    const bars = [
      <Bar dataKey='percent' key='percent' stackId='a' isAnimationActive={false}>
        {data.map((entry: AgeEntry, index: number) => (
          <Cell
            cursor={onClickHandler && 'pointer'}
            fill={entry.name === currentData.name ? colors.active : colors.inactive}
            key={`cell-${index}`}
          ></Cell>
        ))}
      </Bar>,
    ];

    const metrics = currentData
      ? [
          {
            value: currentData.percent === undefined ? '-' : currentData.percent.toFixed(2),
            title: 'Proportion',
            color: colors.active,
            helpText: 'Proportion relative to all samples collected from this age group.',
            percent: true,
          },
          {
            value: currentData.quantity,
            title: 'Samples',
            color: colors.secondary,
            helpText: 'Number of samples of the variant collected from this age group.',
          },
        ]
      : [];

    return ready && data.length > 0 && currentData ? (
      <div ref={ref as React.MutableRefObject<HTMLDivElement>} style={{ height: '100%' }}>
        <DownloadWrapper name='VariantAgeDistributionChart' csvData={csvData}>
          <ChartAndMetrics
            metrics={metrics}
            title='Proportion of the variant per age group in the selected time frame (estimate)'
          >
            <ResponsiveContainer>
              <BarChart
                data={data}
                barCategoryGap='5%'
                margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: 0 }}
                onMouseLeave={handleMouseLeave}
              >
                <XAxis
                  dataKey='name'
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={<CustomTick dataLength={data.length} currentValue={currentData.name} />}
                />
                <YAxis
                  dataKey='percent'
                  interval={1}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={tick => `${tick}%`}
                  allowDecimals={true}
                  hide={false}
                  width={50}
                  domain={[0, (dataMax: number) => maxYAxis(dataMax, Math.ceil(dataMax))]}
                />
                <CartesianGrid vertical={false} />
                {bars}
                <Tooltip
                  active={false}
                  cursor={false}
                  content={tooltipProps => {
                    return (
                      <SetCurrentDataSideEffect tooltipProps={tooltipProps} setCurrentData={setCurrentData} />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartAndMetrics>
        </DownloadWrapper>
      </div>
    ) : (
      <p>Chart not available</p>
    );
  }
);

export default VariantAgeDistributionChart;
