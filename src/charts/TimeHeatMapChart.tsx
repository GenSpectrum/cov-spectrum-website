import React, { useState } from 'react';
import { scaleLinear } from 'd3-scale';
import styled from 'styled-components';
import Metric, { MetricsWrapper } from './Metrics';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from './common';
import dayjs from 'dayjs';

export type TimeHeatMapChartProps = {};

const Cell = styled.td`
  width: 40px;
  min-width: 40px;
  height: 30px;
`;

type TimeHeatMapEntry = {
  date: Date;
  nucMutation: string;
  proportion?: number;
};

function samePosition(entry1?: TimeHeatMapEntry, entry2?: TimeHeatMapEntry) {
  if (!entry1 || !entry2) {
    return false;
  }
  return entry1.date.getTime() === entry2.date.getTime() && entry1.nucMutation === entry2.nucMutation;
}

function generateData(numberRows: number, numberColumns: number): TimeHeatMapEntry[][] {
  const START_DATE = new Date('2021-01-12');
  function drawTwoBases() {
    const BASES = ['A', 'T', 'C', 'G'];
    const base1 = BASES[Math.floor(Math.random() * 4)];
    while (true) {
      const base2 = BASES[Math.floor(Math.random() * 4)];
      if (base2 !== base1) {
        return [base1, base2];
      }
    }
  }
  function drawPosition() {
    return Math.floor(Math.random() * 29003) + 1;
  }
  const nucMutations: string[] = [];
  const dates: Date[] = [];
  for (let i = 0; i < numberRows; i++) {
    const [base1, base2] = drawTwoBases();
    nucMutations.push(base1 + drawPosition() + base2);
  }
  for (let i = 0; i < numberColumns; i++) {
    dates.push(
      dayjs(START_DATE)
        .add(3 * i, 'days')
        .toDate()
    );
  }
  const data: TimeHeatMapEntry[][] = [];
  for (let nucMutation of nucMutations) {
    const row = [];
    for (let date of dates) {
      row.push({
        date,
        nucMutation,
        proportion: Math.random() < 0.1 ? undefined : Math.random(),
      });
    }
    data.push(row);
  }
  return data;
}

const data = generateData(11, 15);

function formatDate(date: Date) {
  return date.getDate() + '.' + (date.getMonth() + 1);
}

export const TimeHeatMapChart = React.memo(
  (_: TimeHeatMapChartProps): JSX.Element => {
    const [active, setActive] = useState<TimeHeatMapEntry | undefined>(undefined);

    const colorScale = scaleLinear<string>().range(['white', 'blue']).domain([0, 1]);

    function handleMouseEnter(cell: TimeHeatMapEntry) {
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
                  {data.map(row => (
                    <tr key={'row-' + row[0].nucMutation}>
                      <td style={{ paddingRight: '20px', height: '30px' }}>{row[0].nucMutation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ overflow: 'auto' }}>
                <table style={{ tableLayout: 'fixed' }}>
                  <tbody>
                    {data.map(row => (
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
                      {data[0].map(cell => (
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
