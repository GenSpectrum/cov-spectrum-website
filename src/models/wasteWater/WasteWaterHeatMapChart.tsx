import React, { useState } from 'react';
import { scaleLinear } from 'd3-scale';
import styled from 'styled-components';
import Metric, { MetricsSpacing, MetricsWrapper } from '../../charts/Metrics';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from '../../charts/common';
import { WasteWaterHeatMapEntry, WasteWaterMutationOccurrencesDataset } from './types';

export type TimeHeatMapChartProps = {
  data: WasteWaterMutationOccurrencesDataset;
};

const Cell = styled.td<{ backgroundColor?: string; active?: boolean }>`
  min-height: 20px;
  height: 20px;
  padding: 0;
  width: 35px;
  min-width: 35px;
  background-color: ${props => props.backgroundColor ?? 'none'};
  outline: ${props => (props.active ? '3px solid black' : 'none')};
  font-size: small;
`;

const XAxisTicksCell = styled(Cell)`
  text-align: center;
`;

const ChartAndMetricsWrapper2 = styled(ChartAndMetricsWrapper)`
  overflow-x: auto;
`;

const ChartWrapper2 = styled(ChartWrapper)`
  display: flex;
  margin-right: 20px;
  overflow-y: auto;
`;

function samePosition(entry1?: WasteWaterHeatMapEntry, entry2?: WasteWaterHeatMapEntry) {
  if (!entry1 || !entry2) {
    return false;
  }
  return entry1.date.getTime() === entry2.date.getTime() && entry1.nucMutation === entry2.nucMutation;
}

function formatDate(date: Date) {
  return date.getDate() + '.' + (date.getMonth() + 1);
}

function transformDataToTableFormat(data: WasteWaterMutationOccurrencesDataset): WasteWaterHeatMapEntry[][] {
  // Get the unique set of dates (rows) and nucMutations (columns)
  const dates: Set<number> = new Set();
  const nucMutations: Set<string> = new Set();
  for (let d of data) {
    dates.add(d.date.getTime());
    nucMutations.add(d.nucMutation);
  }

  // Sort the labels for the rows and columns, and keep their indices in a map
  const dateList = Array.from(dates).sort();
  const nucMutationList = Array.from(nucMutations); // TODO sort the list correctly (by nucleotide position)
  const dateIndexMap: Map<number, number> = new Map();
  const nucMutationIndexMap: Map<string, number> = new Map();
  dateList.forEach((date, i) => dateIndexMap.set(date, i));
  nucMutationList.forEach((nucMutation, i) => nucMutationIndexMap.set(nucMutation, i));

  // Create a table with empty values
  const table: WasteWaterHeatMapEntry[][] = [];
  for (let nucMutation of nucMutationList) {
    const row: WasteWaterHeatMapEntry[] = [];
    for (let date of dateList) {
      row.push({
        date: new Date(date),
        nucMutation,
        proportion: undefined,
      });
    }
    table.push(row);
  }

  // Fill in the existing data
  for (let d of data) {
    table[nucMutationIndexMap.get(d.nucMutation)!][dateIndexMap.get(d.date.getTime())!] = d;
  }

  return table;
}

export const WasteWaterHeatMapChart = React.memo(
  ({ data }: TimeHeatMapChartProps): JSX.Element => {
    const [active, setActive] = useState<WasteWaterHeatMapEntry | undefined>(undefined);

    const processedData: WasteWaterHeatMapEntry[][] = transformDataToTableFormat(data); // TODO group by rows and do sorting

    const colorScale = scaleLinear<string>().range(['white', 'blue']).domain([0, 1]);

    function handleMouseEnter(cell: WasteWaterHeatMapEntry) {
      setActive(cell);
    }

    const nucMutationsLabelTableRows = [];
    const heatMapTableRows = [];
    for (let row of processedData) {
      const nucMutation = row[0].nucMutation;
      nucMutationsLabelTableRows.push(
        <tr key={nucMutation}>
          <Cell>{nucMutation}</Cell>
        </tr>
      );
      heatMapTableRows.push(
        <tr key={nucMutation}>
          {row.map(col => (
            <Cell
              key={nucMutation + col.date.getTime()}
              backgroundColor={col.proportion !== undefined ? colorScale(col.proportion) : 'lightgray'}
              active={samePosition(active, col)}
              onMouseEnter={() => handleMouseEnter(col)}
            />
          ))}
        </tr>
      );
    }
    nucMutationsLabelTableRows.push(
      <tr key={'lastrow'}>
        <Cell />
      </tr>
    );
    heatMapTableRows.push(
      <tr key={'lastrow'}>
        {processedData[0].map(col => (
          <XAxisTicksCell key={col.date.getTime()}>{formatDate(col.date)}</XAxisTicksCell>
        ))}
      </tr>
    );

    return (
      <Wrapper>
        <TitleWrapper>
          {active !== undefined ? (
            <>
              Occurrence of <b>{active.nucMutation}</b> in waste water samples on{' '}
              <b>{formatDate(active.date)}</b>
            </>
          ) : (
            'Occurrence of signature mutations in waste water samples through time'
          )}
        </TitleWrapper>
        <ChartAndMetricsWrapper2>
          <ChartWrapper2>
            <div style={{ width: '70px', height: '100%', display: 'block' }}>
              <table style={{ tableLayout: 'fixed', width: '100px', height: '100%' }}>
                <tbody>{nucMutationsLabelTableRows}</tbody>
              </table>
            </div>
            <div style={{ width: 'calc(100% - 70px)', height: '100%', display: 'block' }}>
              <div style={{ height: '100%' }}>
                <table style={{ tableLayout: 'fixed', width: '100%', height: '100%' }}>
                  <tbody>{heatMapTableRows}</tbody>
                </table>
              </div>
            </div>
          </ChartWrapper2>
          <MetricsWrapper>
            <MetricsSpacing />
            <Metric
              value={active?.proportion !== undefined ? (active.proportion * 100).toFixed(2) + '%' : 'NA'}
              title='Proportion'
              color={colors.active}
              helpText='Proportion of waste water samples containing the mutation.'
            />
          </MetricsWrapper>
        </ChartAndMetricsWrapper2>
      </Wrapper>
    );
  }
);

export default WasteWaterHeatMapChart;
