import React, { useState } from 'react';
import { scaleLinear } from 'd3-scale';
import styled from 'styled-components';
import Metric, { MetricsSpacing, MetricsWrapper } from '../../charts/Metrics';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from '../../charts/common';
import { WasteWaterHeatMapEntry, WasteWaterMutationOccurrencesDataset } from './types';

export type TimeHeatMapChartProps = {
  data: WasteWaterMutationOccurrencesDataset;
};

const Cell = styled.td`
  width: 40px;
  min-width: 40px;
  height: 30px;
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
  const dates: Set<Date> = new Set();
  const nucMutations: Set<string> = new Set();
  for (let d of data) {
    dates.add(d.date);
    nucMutations.add(d.nucMutation);
  }

  // Sort the labels for the rows and columns, and keep their indices in a map
  const dateList = Array.from(dates).sort();
  const nucMutationList = Array.from(nucMutations); // TODO sort the list correctly (by nucleotide position)
  const dateIndexMap: Map<number, number> = new Map();
  const nucMutationIndexMap: Map<string, number> = new Map();
  dateList.forEach((date, i) => dateIndexMap.set(date.getTime(), i));
  nucMutationList.forEach((nucMutation, i) => nucMutationIndexMap.set(nucMutation, i));

  // Create a table with empty values
  const table: WasteWaterHeatMapEntry[][] = [];
  for (let nucMutation of nucMutationList) {
    const row: WasteWaterHeatMapEntry[] = [];
    for (let date of dateList) {
      row.push({
        date,
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

    return (
      <Wrapper>
        <TitleWrapper>
          {active !== undefined
            ? 'Occurrence of ' + active.nucMutation + ' in waste water samples on ' + formatDate(active.date)
            : 'Occurrence of signature mutations in waste water samples through time'}
        </TitleWrapper>
        <ChartAndMetricsWrapper>
          <ChartWrapper>
            <div style={{ display: 'flex', marginRight: '20px' }}>
              <table style={{ tableLayout: 'fixed' }}>
                <tbody>
                  {processedData.map(row => (
                    <tr key={'row-' + row[0].nucMutation}>
                      <td style={{ paddingRight: '20px', height: '30px' }}>{row[0].nucMutation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ overflow: 'auto' }}>
                <table style={{ tableLayout: 'fixed' }}>
                  <tbody>
                    {processedData.map(row => (
                      <tr key={'row-' + row[0].nucMutation}>
                        {row.map(cell => {
                          return (
                            <Cell
                              key={'cell-' + cell.nucMutation + '-' + cell.date}
                              style={{
                                backgroundColor:
                                  cell.proportion !== undefined ? colorScale(cell.proportion) : 'lightgray',
                                outline: samePosition(active, cell) ? '3px solid black' : 'none',
                              }}
                              onMouseEnter={() => handleMouseEnter(cell)}
                            />
                          );
                        })}
                      </tr>
                    ))}
                    <tr>
                      {processedData[0].map(cell => (
                        <td key={'xaxis-' + cell.date} style={{ textAlign: 'center', paddingTop: '10px' }}>
                          {formatDate(cell.date)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ChartWrapper>
          <MetricsWrapper>
            <MetricsSpacing />
            <Metric
              value={active?.proportion !== undefined ? (active.proportion * 100).toFixed(2) + '%' : 'NA'}
              title='Proportion'
              color={colors.active}
              helpText='Proportion of waste water samples containing the mutation.'
            />
          </MetricsWrapper>
        </ChartAndMetricsWrapper>
      </Wrapper>
    );
  }
);

export default WasteWaterHeatMapChart;
