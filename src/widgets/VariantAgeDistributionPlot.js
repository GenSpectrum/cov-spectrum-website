import React, { useEffect, useState } from 'react';
import { fetchVariantDistributionData } from '../services/api';

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from 'react-plotly.js/factory';

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);

export const VariantAgeDistributionPlot = ({ data }) => {
  const [distribution, setDistribution] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    fetchVariantDistributionData('Age', data.country, data.mutations, data.matchPercentage, signal).then(
      newDistributionData => {
        if (isSubscribed) {
          setDistribution(newDistributionData);
        }
      }
    );
    return () => {
      isSubscribed = false;
      controller.abort();
      console.log('Cleanup render for variant age distribution plot');
    };
  }, [data]);

  return (
    <div style={{ height: '100%' }}>
      {distribution != null && !distribution.error && (
        <Plot
          style={{ width: '100%', height: '100%' }}
          data={[
            {
              type: 'bar',
              x: distribution.map(d => d.x),
              y: distribution.map(d => d.y.count),
            },
            {
              x: distribution.map(d => d.x),
              y: distribution.map(d => d.y.proportion.value * 100),
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'red' },
              yaxis: 'y2',
            },
          ]}
          layout={{
            title: 'Age Distribution',
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
      {distribution && distribution.error && <p>Error loading data</p>}
    </div>
  );
};
