import React from 'react';
import { WasteWaterTimeseriesSummaryDataset } from './types';
import { UnifiedDay } from '../../helpers/date-cache';
import { getTicks } from '../../helpers/ticks';
import { TitleWrapper, Wrapper } from '../../widgets/common';
import { Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { formatDate } from './WasteWaterTimeChart';
import { wastewaterVariantColors } from './constants';
import { Utils } from '../../services/Utils';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { DateRange } from '../../data/DateRange';

interface Props {
  variants: {
    name: string;
    data: WasteWaterTimeseriesSummaryDataset;
  }[];
  dateRange: {
    dateFrom: UnifiedDay;
    dateTo: UnifiedDay;
  };
}

interface VariantMap {
  [variantName: string]: number;
}

interface CIMap {
  [variantName: string]: [number, number];
}

/**
 * The key name that will be passed to recharts may not contain additional dots because dots are used to
 * navigate through nested objects.
 */
function escapeValueName(name: string): string {
  return name.replaceAll('.', '__');
}

function deEscapeValueName(escapedName: string): string {
  return escapedName.replaceAll('__', '.');
}

const CHART_MARGIN_RIGHT = 15;

function formatProportion(value: number, digitsAfterDot?: number): string {
  return (Number(value) * 100).toFixed(digitsAfterDot ?? 2);
}

function formatPercent(value: number, digitsAfterDot?: number): string {
  return formatProportion(value, digitsAfterDot) + '%';
}

function formatCiPercent(ci: [number, number]): string {
  return `[${formatProportion(ci[0])} - ${formatPercent(ci[1])}]`;
}

const TooltipRow = ({
  name,
  proportion,
  proportionCI,
  color,
}: {
  name: string;
  proportion: number;
  proportionCI: [number, number];
  color: string;
}) => {
  function format(name: string, value: number, ci: [number, number]): string {
    return `${deEscapeValueName(name)}: ${formatPercent(value)} ${formatCiPercent(ci)}`;
  }

  return <p style={{ color: color }}>{format(name, proportion, proportionCI)}</p>;
};

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className='custom-tooltip'>
        <div>Date: {formatDate(payload[0].payload.date)}</div>
        <div>
          {payload.map((p: any) => {
            const name = p.name.replace('proportions.', '');
            return (
              <TooltipRow
                key={`tooltipRow${name}`}
                name={name}
                proportion={p.payload.proportions[name]}
                proportionCI={p.payload.proportionCIs[name]}
                color={p.color}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

function getEscapedVariantNames(variants: { name: string }[]): string[] {
  return variants.map(variant => escapeValueName(variant.name));
}

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
  dateFrom: number,
  dateTo: number
) {
  const datesToSelectFrom = plotData.map(({ date }) => date);
  datesToSelectFrom.push(dateFrom);
  datesToSelectFrom.push(dateTo);
  datesToSelectFrom.sort((a, b) => a - b);

  const ticks = getTicks(
    datesToSelectFrom.map(date => {
      return { date: new Date(date) };
    })
  ); // TODO This does not seem efficient

  return ticks;
}

function getXAxisDomain(dateRange: DateRange, ticks: number[]) {
  const dateFrom = dateRange.dateFrom?.dayjs.valueOf() ?? ticks[0];
  const dateTo = dateRange.dateTo?.dayjs.valueOf() ?? ticks[ticks.length - 1];
  return [dateFrom, dateTo];
}

export const WasteWaterLocationTimeChart = React.memo(({ variants, dateRange }: Props): JSX.Element => {
  const escapedVariantNames = getEscapedVariantNames(variants);
  const plotData = getPlotData(variants);
  const ticks = getXAxisTicks(plotData, dateRange.dateFrom.dayjs.valueOf(), dateRange.dateTo.dayjs.valueOf());
  const plotXAxisDomain = getXAxisDomain(dateRange, ticks);

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
            domain={plotXAxisDomain}
            ticks={ticks}
          />

          <YAxis domain={['dataMin', 'auto']} tickFormatter={value => formatPercent(value, 0)} />
          <Tooltip
            content={<CustomTooltip />}
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
