import React, { useState, useEffect } from 'react';
import { getVariantDistributionData } from '../services/api';

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from 'react-plotly.js/factory';
import { VariantTimeDistributionDataPoint, DataDistributionConfiguration } from '../helpers/types';

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);

interface Props {
  data: DataDistributionConfiguration;
}
export const VariantTimeDistributionPlot = ({ data }: Props) => {
  const [distribution, setDistribution] = useState<VariantTimeDistributionDataPoint[] | undefined>(undefined);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData('Time', data.country, data.mutations, data.matchPercentage, signal).then(
      newDistributionData => {
        if (isSubscribed) {
          console.log('TIME SET', newDistributionData);
          setDistribution(newDistributionData);
        } else {
          console.log('TIME NOT SET');
        }
      }
    );
    return () => {
      isSubscribed = false;
      controller.abort();
      console.log('TIME Cleanup render for variant age distribution plot');
    };
  }, [data]);

  return (
    <div style={{ height: '100%' }}>
      {distribution != null && (
        <Plot
          style={{ width: '100%', height: '100%' }}
          data={[
            {
              name: 'Sequences',
              type: 'bar',
              x: distribution.map(d => new Date(d.x.firstDayInWeek)),
              y: distribution.map(d => d.y.count),
            },
            {
              x: distribution.map(d => new Date(d.x.firstDayInWeek)),
              y: distribution.map(d => d.y.proportion.value * 100),
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'red' },
              yaxis: 'y2',
              hovertemplate: '%{y:.2f}%<extra></extra>',
            },
          ]}
          layout={{
            title: 'Time Distribution',
            xaxis: {
              title: 'Week',
              type: 'date',
              tickvals: distribution.map(d => d.x.firstDayInWeek),
              tickformat: 'W%-V, %Y',
              hoverformat: 'Week %-V, %Y (from %d.%m.)',
            },
            yaxis: {
              title: 'Number Sequences',
            },
            yaxis2: {
              title: 'Estimated Percentage',
              overlaying: 'y',
              side: 'right',
            },
            showlegend: false,
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
