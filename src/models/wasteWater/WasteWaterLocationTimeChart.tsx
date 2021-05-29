import React from 'react';
import { WasteWaterTimeseriesSummaryDataset } from './types';
import { UnifiedDay } from '../../helpers/date-cache';
import { getTicks } from '../../helpers/ticks';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { ChartAndMetricsWrapper, ChartWrapper, TitleWrapper, Wrapper } from '../../charts/common';
import { ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate } from './WasteWaterTimeChart';

interface Props {
  variants: {
    name: string;
    data: WasteWaterTimeseriesSummaryDataset;
  }[];
}

interface VariantMap {
  [key: string]: number;
}

interface CIMap {
  [key: string]: [number, number];
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

export const WasteWaterLocationTimeChart = React.memo(
  ({ variants }: Props): JSX.Element => {
    const variantNames = variants.map(d => escapeValueName(d.name));
    const dateMap: Map<UnifiedDay, { date: number; values: VariantMap; cis: CIMap }> = new Map();

    for (let { name, data } of variants) {
      for (let { date, proportion, proportionCI } of data) {
        if (!dateMap.has(date)) {
          dateMap.set(date, {
            date: date.dayjs.valueOf(),
            values: {},
            cis: {},
          });
        }
        dateMap.get(date)!.values[escapeValueName(name)] = Math.max(proportion, 0);
        dateMap.get(date)!.cis[escapeValueName(name)] = proportionCI;
      }
    }

    const plotData = [...dateMap.values()].sort((a, b) => a.date - b.date);
    const today = Date.now();
    const ticks = getTicks(plotData.map(({ date }) => ({ date: new Date(date) }))); // TODO This does not seem efficient
    ticks.push(today);

    const colorScale = scaleOrdinal(schemeCategory10);
    return (
      <Wrapper>
        <TitleWrapper>Estimated prevalence in wastewater samples</TitleWrapper>
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
                  domain={[(dataMin: any) => dataMin, () => today]}
                  ticks={ticks}
                />
                <YAxis domain={['dataMin', 'auto']} />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => {
                    const escapedName = name.replace('values.', '');
                    const [ciLower, ciUpper] = props.payload.cis[escapedName];
                    return [
                      (value * 100).toFixed(2) +
                        '% [' +
                        (ciLower * 100).toFixed(2) +
                        '-' +
                        (ciUpper * 100).toFixed(2) +
                        '%]',
                      deEscapeValueName(escapedName),
                    ];
                  }}
                  labelFormatter={label => {
                    return 'Date: ' + formatDate(label);
                  }}
                />
                {variantNames.map(variant => (
                  <Line
                    type='monotone'
                    dataKey={'values.' + variant}
                    strokeWidth={3}
                    stroke={colorScale(variant)}
                    dot={false}
                    isAnimationActive={false}
                    key={variant}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartAndMetricsWrapper>
      </Wrapper>
    );
  }
);
