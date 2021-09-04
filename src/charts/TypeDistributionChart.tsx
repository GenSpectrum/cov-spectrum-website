import React, { useEffect, useState, useCallback } from 'react';
import { ChartAndMetrics } from './Metrics';
import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { colors } from './common';

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

export type TypeDistributionEntry = {
  name: string;
  percent: number;
  quantity: number;
};

export type TypeDistributionChartProps = {
  data: TypeDistributionEntry[];
  onClickHandler?: OnClickHandler;
};

export const TypeDistributionChart = React.memo(
  ({ data, onClickHandler }: TypeDistributionChartProps): JSX.Element => {
    const [ready, setReady] = useState(false);
    const [currentData, setCurrentData] = useState<TypeDistributionEntry>(data[data.length - 1]);

    useEffect(() => {
      setReady(true);
    }, []);

    const resetDefault = useCallback(() => {
      const maxIndex = data.reduce(
        (iMax: number, x: TypeDistributionEntry, i: number, arr: TypeDistributionEntry[]) =>
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
        {data.map((entry: TypeDistributionEntry, index: number) => (
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
      <ChartAndMetrics metrics={metrics} title='Proportion of the variant per age group in the selected time frame (estimate)'>
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
              domain={[0, (dataMax: number) => Math.ceil(dataMax)]}
            />
            <CartesianGrid vertical={false} />
            {bars}
            <Tooltip
              active={false}
              cursor={false}
              content={(e: any) => {
                if (e?.payload.length > 0) {
                  setCurrentData(e.payload[0].payload);
                }
                return <></>;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartAndMetrics>
    ) : (
      <p>Chart not available</p>
    );
  }
);

export default TypeDistributionChart;
