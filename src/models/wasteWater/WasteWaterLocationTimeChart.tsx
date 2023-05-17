import React from 'react';
import { WasteWaterTimeseriesSummaryDataset } from './types';
import { UnifiedDay } from '../../helpers/date-cache';
import { getTicks } from '../../helpers/ticks';
import { TitleWrapper, Wrapper } from '../../widgets/common';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate } from './WasteWaterTimeChart';
import { wastewaterVariantColors } from './constants';
import { Utils } from '../../services/Utils';
import { DateRange } from '../../data/DateRange';
import { WasteWaterTooltip } from './WasteWaterLocationTimeChartTooltip';
import { formatPercent } from '../../helpers/format-data';
import { deEscapeValueName, escapeValueName } from './RechartsKeyConversion';

interface Props {
  variants: {
    name: string;
    data: WasteWaterTimeseriesSummaryDataset;
  }[];
  dateRange: DateRange;
}

interface VariantMap {
  [variantName: string]: number;
}

interface CIMap {
  [variantName: string]: [number, number];
}

const CHART_MARGIN_RIGHT = 15;

function getPlotData(variants: { name: string; data: WasteWaterTimeseriesSummaryDataset }[]) {
  const dateMap: Map<UnifiedDay, { date: number; proportions: VariantMap; proportionCIs: CIMap }> = new Map();

  for (let { name, data } of variants) {
    for (let { date, proportion, proportionCI } of data) {
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date: date.dayjs.valueOf(),
          proportions: {},
          proportionCIs: {},
        });
      }
      dateMap.get(date)!.proportions[escapeValueName(name)] = Math.max(proportion, 0);
      dateMap.get(date)!.proportionCIs[escapeValueName(name)] = proportionCI;
    }
  }

  return [...dateMap.values()].sort((a, b) => a.date - b.date);
}

function getXAxisTicks(
  plotData: { date: number; proportions: VariantMap; proportionCIs: CIMap }[],
  dateRange: DateRange
) {
  const datesToSelectFrom = plotData.map(({ date }) => date);
  if (dateRange.dateFrom) {
    datesToSelectFrom.push(dateRange.dateFrom.dayjs.valueOf());
  }
  if (dateRange.dateTo) {
    datesToSelectFrom.push(dateRange.dateTo.dayjs.valueOf());
  }
  datesToSelectFrom.sort((a, b) => a - b);

  return getTicks(
    datesToSelectFrom.map(date => {
      return { date: new Date(date) };
    })
  );
}

function getXAxisDomain(dateRange: DateRange, ticks: number[]) {
  const dateFrom = dateRange.dateFrom?.dayjs.valueOf() ?? ticks[0];
  const dateTo = dateRange.dateTo?.dayjs.valueOf() ?? ticks[ticks.length - 1];
  return [dateFrom, dateTo];
}

export const WasteWaterLocationTimeChart = React.memo(({ variants, dateRange }: Props): JSX.Element => {
  const escapedVariantNames = variants.map(variant => escapeValueName(variant.name));
  const plotData = getPlotData(variants);
  const xAxisTicks = getXAxisTicks(plotData, dateRange);
  const xAxisDomain = getXAxisDomain(dateRange, xAxisTicks);

  if (plotData.length === 0) {
    return <div>No data</div>;
  }

  return (
    <Wrapper>
      <TitleWrapper>Estimated prevalence in wastewater samples</TitleWrapper>
      <ResponsiveContainer>
        <LineChart
          data={plotData}
          margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: 0 }}
          data-testid='ComposedChart-chart'
        >
          <XAxis
            dataKey='date'
            scale='time'
            type='number'
            tickFormatter={formatDate}
            domain={xAxisDomain}
            ticks={xAxisTicks}
          />

          <YAxis domain={['dataMin', 'auto']} tickFormatter={value => formatPercent(value, 0)} />
          <Tooltip
            content={<WasteWaterTooltip />}
            wrapperStyle={{
              backgroundColor: 'white',
              border: '2px solid #ccc',
              borderRadius: '5px',
              zIndex: 1000,
            }}
          />
          {escapedVariantNames.map(escapedVariant => (
            <Line
              type='monotone'
              dataKey={'proportions.' + escapedVariant}
              strokeWidth={3}
              stroke={
                wastewaterVariantColors[deEscapeValueName(escapedVariant)] ?? Utils.getRandomColorCode()
              }
              dot={false}
              isAnimationActive={false}
              key={escapedVariant}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Wrapper>
  );
});
