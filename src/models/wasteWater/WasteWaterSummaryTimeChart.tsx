import React from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { ChartAndMetricsWrapper, ChartWrapper, TitleWrapper, Wrapper } from '../../widgets/common';
import { ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WasteWaterTimeseriesSummaryDataset } from './types';
import { formatDate } from './WasteWaterTimeChart';
import { getTicks } from '../../helpers/ticks';
import { UnifiedDay } from '../../helpers/date-cache';

interface Props {
  wasteWaterPlants: {
    location: string;
    data: WasteWaterTimeseriesSummaryDataset;
  }[];
}

interface LocationMap {
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

export const WasteWaterSummaryTimeChart = React.memo(
  ({ wasteWaterPlants }: Props): JSX.Element => {
    const locations = wasteWaterPlants.map(d => escapeValueName(d.location));
    const dateMap: Map<UnifiedDay, { date: number; values: LocationMap; cis: CIMap }> = new Map();

    for (let { location, data } of wasteWaterPlants) {
      for (let { date, proportion, proportionCI } of data) {
        if (!dateMap.has(date)) {
          dateMap.set(date, {
            date: date.dayjs.valueOf(),
            values: {},
            cis: {},
          });
        }
        dateMap.get(date)!.values[escapeValueName(location)] = Math.max(proportion, 0);
        dateMap.get(date)!.cis[escapeValueName(location)] = proportionCI;
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
                {locations.map(location => (
                  <Line
                    type='monotone'
                    dataKey={'values.' + location}
                    strokeWidth={3}
                    stroke={colorScale(location)}
                    dot={false}
                    isAnimationActive={false}
                    key={location}
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

export default WasteWaterSummaryTimeChart;
