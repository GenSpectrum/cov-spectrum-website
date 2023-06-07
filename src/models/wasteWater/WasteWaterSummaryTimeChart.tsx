import React from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { ChartAndMetricsWrapper, ChartWrapper, TitleWrapper, Wrapper } from '../../widgets/common';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WasteWaterTimeseriesSummaryDataset } from './types';
import { formatDate } from './WasteWaterTimeChart';
import { getTicks } from '../../helpers/ticks';
import { UnifiedDay } from '../../helpers/date-cache';
import { escapeValueName } from './RechartsKeyConversion';
import { WasteWaterTooltip } from './WasteWaterLocationTimeChartTooltip';

interface Props {
  wasteWaterPlants: {
    location: string;
    data: WasteWaterTimeseriesSummaryDataset;
  }[];
}

interface LocationMap {
  [location: string]: number;
}

interface CIMap {
  [location: string]: [number, number];
}

const CHART_MARGIN_RIGHT = 15;

function getPlotData(wasteWaterPlants: { location: string; data: WasteWaterTimeseriesSummaryDataset }[]) {
  const dateMap: Map<UnifiedDay, { date: number; proportions: LocationMap; proportionCIs: CIMap }> =
    new Map();

  for (let { location, data } of wasteWaterPlants) {
    for (let { date, proportion, proportionCI } of data) {
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date: date.dayjs.valueOf(),
          proportions: {},
          proportionCIs: {},
        });
      }
      dateMap.get(date)!.proportions[escapeValueName(location)] = Math.max(proportion, 0);
      dateMap.get(date)!.proportionCIs[escapeValueName(location)] = proportionCI;
    }
  }

  return [...dateMap.values()].sort((a, b) => a.date - b.date);
}

export const WasteWaterSummaryTimeChart = React.memo(({ wasteWaterPlants }: Props): JSX.Element => {
  const locations = wasteWaterPlants.map(d => escapeValueName(d.location));
  const plotData = getPlotData(wasteWaterPlants);

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
            <LineChart data={plotData} margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: 0 }}>
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
                content={<WasteWaterTooltip />}
                wrapperStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #ccc',
                  borderRadius: '5px',
                  zIndex: 1000,
                }}
              />
              {locations.map(location => (
                <Line
                  type='monotone'
                  dataKey={'proportions.' + location}
                  strokeWidth={3}
                  stroke={colorScale(location)}
                  dot={false}
                  isAnimationActive={false}
                  key={location}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </ChartAndMetricsWrapper>
    </Wrapper>
  );
});

export default WasteWaterSummaryTimeChart;
