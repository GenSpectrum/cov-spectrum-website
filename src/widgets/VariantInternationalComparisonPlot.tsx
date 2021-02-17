import React, { useState, useEffect } from 'react';
import { DistributionType, getVariantDistributionData } from '../services/api';

import { DataDistributionConfiguration } from '../helpers/types';

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from 'react-plotly.js/factory';
import { InternationalTimeDistributionEntry, ValueWithCI } from '../services/api-types';

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);

const digitsForPercent = (v: number): string => (v * 100).toFixed(2);

const valueAndCIToString = (v: ValueWithCI): string =>
  `${digitsForPercent(v.value)}% [${digitsForPercent(v.ciLower)}%, ${digitsForPercent(v.ciUpper)}%]`;

interface Props {
  data: DataDistributionConfiguration;
}

export const VariantInternationalComparisonPlot = ({ data }: Props) => {
  const [plotData, setPlotData] = useState<InternationalTimeDistributionEntry[] | undefined>(undefined);
  const [colorMap, setColorMap] = useState<any>(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(
      DistributionType.International,
      data.country,
      data.mutations,
      data.matchPercentage,
      signal
    ).then(newDistributionData => {
      if (isSubscribed) {
        const countriesToPlot = new Set(['United Kingdom', 'Denmark', 'Switzerland', data.country]);
        const newPlotData = newDistributionData.filter((d: any) => countriesToPlot.has(d.x.country));
        // TODO Remove hard-coding..
        const newColorMap = [
          { target: 'United Kingdom', value: { marker: { color: 'black' } } },
          { target: 'Denmark', value: { marker: { color: 'green' } } },
          { target: 'Switzerland', value: { marker: { color: 'red' } } },
        ];
        if (!['United Kingdom', 'Denmark', 'Switzerland'].includes(data.country)) {
          newColorMap.push({
            target: data.country,
            value: { marker: { color: 'blue' } },
          });
        }
        setColorMap(newColorMap);
        setPlotData(newPlotData);
      }
    });
    return () => {
      isSubscribed = false;
      controller.abort();
      console.log('Cleanup render for variant age distribution plot');
    };
  }, [data]);

  const makeCIData = (
    plotData: InternationalTimeDistributionEntry[],
    getY: (entry: InternationalTimeDistributionEntry) => number
  ): Plotly.Data => {
    return {
      type: 'scatter',
      mode: 'lines',
      x: plotData.map(d => d.x.week.firstDayInWeek),
      y: plotData.map(d => digitsForPercent(getY(d))),
      line: {
        dash: 'dash',
        width: 2,
      },
      transforms: [
        {
          type: 'groupby',
          groups: plotData.map(d => d.x.country),
          styles: colorMap,
        },
      ],
      showlegend: false,
      hoverinfo: 'x',
    };
  };

  return (
    <div style={{ height: '100%' }}>
      {!plotData && <p>Loading...</p>}
      {plotData && (
        <Plot
          style={{ width: '100%', height: '100%' }}
          data={[
            {
              type: 'scatter',
              mode: 'lines+markers',
              x: plotData.map(d => d.x.week.firstDayInWeek),
              y: plotData.map(d => digitsForPercent(d.y.proportion.value)),
              text: plotData.map(d => valueAndCIToString(d.y.proportion)),
              transforms: [
                {
                  type: 'groupby',
                  groups: plotData.map(d => d.x.country),
                  styles: colorMap,
                  nameformat: '%{group}',
                },
              ],
              hovertemplate: '%{text}',
            },
            makeCIData(plotData, d => d.y.proportion.ciLower),
            makeCIData(plotData, d => d.y.proportion.ciUpper),
          ]}
          layout={{
            title: '',
            xaxis: {
              title: 'Week',
              type: 'date',
              tickvals: plotData.map(d => d.x.week.firstDayInWeek),
              tickformat: 'W%-V, %Y',
              hoverformat: 'Week %-V, %Y (from %d.%m.)',
            },
            yaxis: {
              title: 'Estimated Percentage',
            },
            legend: {
              x: 0,
              xanchor: 'left',
              y: 1,
            },
          }}
          config={{
            displaylogo: false,
            modeBarButtons: [['zoom2d', 'toImage', 'resetScale2d', 'pan2d']],
            responsive: true,
          }}
        />
      )}
    </div>
  );
};
