import React, { useEffect, useState, useCallback } from 'react';
import { ChartAndMetrics } from './Metrics';
import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { colors, TimeTick } from './common';

const CHART_MARGIN_RIGHT = 30;
const CHART_MARGIN_BOTTOM = 10;

export type OnClickHandler = (index: number) => boolean;

export type TimeEntry = {
  firstDayInWeek: string;
  yearWeek: string;
  percent?: number;
  quantity: number;
};

export type TimeChartProps = {
  data: TimeEntry[];
  onClickHandler?: OnClickHandler;
};

export const TimeChart = React.memo(
  ({ data, onClickHandler }: TimeChartProps): JSX.Element => {
    const [currentData, setCurrentData] = useState<TimeEntry>(data[data.length - 1]);

    const resetDefault = useCallback(() => {
      setCurrentData(data[data.length - 1]);
    }, [data]);

    useEffect(() => {
      resetDefault();
    }, [data, resetDefault]);

    const handleMouseLeave = (): void => {
      resetDefault();
    };

    const bars = [
      <Bar dataKey='percent' key='percent' stackId='a' isAnimationActive={false}>
        {data.map((entry: TimeEntry, index: number) => (
          <Cell
            cursor={onClickHandler && 'pointer'}
            fill={entry.yearWeek === currentData.yearWeek ? colors.active : colors.inactive}
            key={`cell-${index}`}
          ></Cell>
        ))}
      </Bar>,
    ];

    const metrics = currentData
      ? [
          {
            value:
              currentData.percent === undefined
                ? '-'
                : (Math.round(currentData.percent * 10) / 10).toString(),
            title: 'Proportion',
            color: colors.active,
            helpText: 'Estimated proportion relative to all samples collected.',
            percent: true,
          },
          {
            value: currentData.quantity,
            title: 'Samples',
            color: colors.secondary,
            helpText: 'Number of samples of the variant collected in this time frame.',
          },
        ]
      : [];

    const onlyDisplayActive = !(currentData === data[data.length - 1]);

    return currentData ? (
      <ChartAndMetrics
        metrics={metrics}
        title={`Proportion of all samples sequenced on week ${currentData.yearWeek.split('-')[1]}, ${
          currentData.yearWeek.split('-')[0] + ' '
        }`}
      >
        <ResponsiveContainer>
          <BarChart
            data={data}
            barCategoryGap='5%'
            margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: CHART_MARGIN_BOTTOM }}
            onMouseLeave={handleMouseLeave}
          >
            <XAxis
              dataKey='yearWeek'
              axisLine={false}
              tickLine={false}
              interval={onlyDisplayActive ? 0 : 'preserveStartEnd'}
              tick={
                <TimeTick
                  dataLength={data.length}
                  currentValue={currentData.yearWeek}
                  unit='week'
                  onlyDisplayActive={onlyDisplayActive}
                />
              }
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

export default TimeChart;
