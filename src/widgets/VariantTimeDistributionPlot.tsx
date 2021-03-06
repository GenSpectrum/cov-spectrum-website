import React, { useState, useEffect } from 'react';
import { DistributionType, getVariantDistributionData } from '../services/api';
import { TimeDistributionEntry } from '../services/api-types';
import { Plot } from '../components/Plot';
import { SampleSelectorSchema } from '../helpers/sample-selector';
import { Widget } from './Widget';
import * as zod from 'zod';
import { ZodQueryEncoder } from '../helpers/query-encoder';
import { fillWeeklyApiData } from '../helpers/fill-missing';

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema>;

interface EntryWithoutCI {
  x: TimeDistributionEntry['x'];
  y: {
    count: number;
    proportion: number;
  };
}

export const VariantTimeDistributionPlot = ({ country, mutations, matchPercentage }: Props) => {
  const [distribution, setDistribution] = useState<EntryWithoutCI[] | undefined>(undefined);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(DistributionType.Time, country, mutations, matchPercentage, signal).then(
      newDistributionData => {
        if (isSubscribed) {
          setDistribution(
            fillWeeklyApiData(
              newDistributionData.map(({ x, y }) => ({
                x,
                y: { count: y.count, proportion: y.proportion.value },
              })),
              { count: 0, proportion: 0 }
            )
          );
        }
      }
    );
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, mutations, matchPercentage]);

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
              y: distribution.map(d => d.y.proportion * 100),
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

export const VariantTimeDistributionPlotWidget = new Widget(
  new ZodQueryEncoder(PropsSchema),
  VariantTimeDistributionPlot,
  'VariantTimeDistributionPlot'
);
