import React, { useEffect, useState } from 'react';
import { DistributionType, getVariantDistributionData } from '../services/api';
import { AgeDistributionEntry } from '../services/api-types';
import { Plot } from '../components/Plot';
import { SampleSelectorSchema } from '../helpers/sample-selector';
import { Widget } from './Widget';
import * as zod from 'zod';
import { ZodQueryEncoder } from '../helpers/query-encoder';
import { fillAgeKeyedApiData } from '../helpers/fill-missing';

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema>;

interface EntryWithoutCI {
  x: AgeDistributionEntry['x'];
  y: {
    count: number;
    proportion: number;
  };
}

const VariantAgeDistributionPlot = ({ country, mutations, matchPercentage }: Props) => {
  const [distributionData, setDistributionData] = useState<EntryWithoutCI[] | undefined>(undefined);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(DistributionType.Age, country, mutations, matchPercentage, signal)
      .then(newDistributionData => {
        if (isSubscribed) {
          setDistributionData(
            fillAgeKeyedApiData(
              newDistributionData.map(({ x, y }) => ({
                x,
                y: { count: y.count, proportion: y.proportion.value },
              })),
              { count: 0, proportion: 0 }
            )
          );
        }
      })
      .catch(e => {
        console.log('Called fetch data error', e);
      });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, mutations, matchPercentage]);

  return (
    <div style={{ height: '100%' }}>
      {distributionData !== undefined && (
        <Plot
          style={{ width: '100%', height: '100%' }}
          data={[
            {
              name: 'Sequences',
              type: 'bar',
              x: distributionData.map(d => d.x),
              y: distributionData.map(d => d.y.count),
            },
            {
              x: distributionData.map(d => d.x),
              y: distributionData.map(d => d.y.proportion * 100),
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'red' },
              yaxis: 'y2',
              hovertemplate: '%{y:.2f}%<extra></extra>',
            },
          ]}
          layout={{
            title: '',
            xaxis: {
              title: 'Age',
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
            margin: { t: 10 },
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

export const VariantAgeDistributionPlotWidget = new Widget(
  new ZodQueryEncoder(PropsSchema),
  VariantAgeDistributionPlot,
  'VariantAgeDistributionPlot'
);
