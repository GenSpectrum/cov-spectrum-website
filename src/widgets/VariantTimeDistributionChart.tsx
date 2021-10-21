import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ChartAndMetrics } from './Metrics';
import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { colors, TimeTick } from './common';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { fillAndFilterFromWeeklyMap } from '../helpers/fill-missing';
import DownloadWrapper from './DownloadWrapper';

const CHART_MARGIN_RIGHT = 30;
const CHART_MARGIN_BOTTOM = 10;

type TimeEntry = {
  firstDayInWeek: string;
  yearWeek: string;
  percent?: number;
  quantity: number;
};

export type VariantTimeDistributionChartProps = {
  variantSampleSet: DateCountSampleDataset;
  wholeSampleSet: DateCountSampleDataset;
};

export const VariantTimeDistributionChart = React.memo(
  ({ variantSampleSet, wholeSampleSet }: VariantTimeDistributionChartProps): JSX.Element => {
    const data = useMemo(() => {
      const proportionByWeek = DateCountSampleDataset.proportionByWeek(
        variantSampleSet.getPayload(),
        wholeSampleSet.getPayload()
      );
      return fillAndFilterFromWeeklyMap(
        proportionByWeek,
        {
          count: 0,
          proportion: 0,
        },
        variantSampleSet.getSelector().dateRange!.getDateRange()
      ).map(({ key, value: { count, proportion } }) => ({
        firstDayInWeek: key.firstDay.string,
        yearWeek: key.yearWeekString,
        percent: proportion === undefined ? undefined : 100 * proportion,
        quantity: count,
      }));
    }, [variantSampleSet, wholeSampleSet]);

    const csvData = useMemo(() => {
      return data.map(({ yearWeek, percent, quantity }) => ({
        yearWeek,
        numberSamples: quantity,
        proportion: percent ? (percent / 100).toFixed(6) : undefined,
      }));
    }, [data]);

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
            fill={entry.yearWeek === currentData.yearWeek ? colors.active : colors.inactive}
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
      <DownloadWrapper name='VariantTimeDistributionChart' csvData={csvData}>
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
      </DownloadWrapper>
    ) : (
      <p>Chart not available</p>
    );
  }
);

export default VariantTimeDistributionChart;
