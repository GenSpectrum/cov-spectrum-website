import React from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from '../../charts/common';
import { ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WasteWaterTimeseriesSummaryDataset } from './types';
import { formatDate, getTicks } from './WasteWaterTimeChart';
import Metric, { MetricsSpacing, MetricsWrapper } from '../../charts/Metrics';

interface Props {
  wasteWaterPlants: {
    location: string;
    data: WasteWaterTimeseriesSummaryDataset;
  }[];
}

const CHART_MARGIN_RIGHT = 15;

export const WasteWaterSummaryTimeChart = React.memo(
  ({ wasteWaterPlants }: Props): JSX.Element => {
    const locations = wasteWaterPlants.map(d => d.location);
    const dateMap: Map<number, any> = new Map();

    for (let { location, data } of wasteWaterPlants) {
      for (let { date, proportion } of data) {
        const timestamp = date.getTime();
        if (!dateMap.has(timestamp)) {
          dateMap.set(timestamp, {
            date,
          });
        }
        dateMap.get(timestamp)[location] = Math.max(proportion, 0);
      }
    }

    const plotData = [...dateMap.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
    const today = Date.now();
    const ticks = getTicks(plotData);
    ticks.push(today);

    const colorScale = scaleOrdinal(schemeCategory10);
    return (
      <Wrapper>
        <TitleWrapper>Estimated prevalence in waste water samples</TitleWrapper>
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
                  formatter={(value: any, name: any, props: any) => (value * 100).toFixed(2) + '%'}
                  labelFormatter={label => {
                    return 'Date: ' + formatDate(label);
                  }}
                />
                {locations.map(location => (
                  <Line
                    type='monotone'
                    dataKey={location}
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
