import React from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { ChartAndMetricsWrapper, ChartWrapper, TitleWrapper, Wrapper } from '../../charts/common';
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

const CHART_MARGIN_RIGHT = 15;

export const WasteWaterSummaryTimeChart = React.memo(
  ({ wasteWaterPlants }: Props): JSX.Element => {
    const locations = wasteWaterPlants.map(d => d.location);
    const dateMap: Map<UnifiedDay, { date: number; values: LocationMap }> = new Map();

    for (let { location, data } of wasteWaterPlants) {
      for (let { date, proportion } of data) {
        if (!dateMap.has(date)) {
          dateMap.set(date, {
            date: date.dayjs.valueOf(),
            values: {},
          });
        }
        dateMap.get(date)!.values[location] = Math.max(proportion, 0);
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
                  formatter={(value: any) => (value * 100).toFixed(2) + '%'}
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
