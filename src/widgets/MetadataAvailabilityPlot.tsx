import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import {
  SequencingRepresentativenessSelector,
  SequencingRepresentativenessSelectorSchema,
} from '../services/api-types';
import React, { useEffect, useState } from 'react';
import { getSequenceCounts } from '../services/api';
import { Attribute, attributes } from './SequencingRepresentativenessPlot';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from '../charts/common';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Metrics, { MetricsSpacing, MetricsWrapper } from '../charts/Metrics';
import { kFormat } from '../helpers/number';
import Loader from '../components/Loader';

interface Props {
  selector: SequencingRepresentativenessSelector;
}

interface PlotEntry {
  attributeLabel: string;
  proportion: number;
  known: number;
  unknown: number;
}

export const MetadataAvailabilityPlot = ({ selector }: Props) => {
  const [data, setData] = useState<undefined | PlotEntry[]>(undefined);
  const [active, setActive] = useState<undefined | PlotEntry>(undefined);

  useEffect(() => {
    getSequenceCounts(selector).then(counts => {
      let total = 0;
      const knownOfAttribute: Map<Attribute, number> = new Map(attributes.map(({ key }) => [key, 0]));
      for (let countEntry of counts) {
        total += countEntry.count;
        for (let { key } of attributes) {
          if (countEntry[key] !== null) {
            knownOfAttribute.set(key, countEntry.count + knownOfAttribute.get(key)!);
          }
        }
      }
      const _data = attributes.map(({ key, label }) => ({
        attributeLabel: label,
        proportion: (knownOfAttribute.get(key)! / total) * 100,
        known: knownOfAttribute.get(key)!,
        unknown: total - knownOfAttribute.get(key)!,
      }));
      setData(_data);
    });
  }, [selector, setData]);

  if (!data) {
    return <Loader />;
  }

  return (
    <Wrapper>
      <ChartAndMetricsWrapper>
        <ChartWrapper className='-mr-4 -ml-1'>
          <ResponsiveContainer>
            <BarChart layout='vertical' data={data} margin={{ left: 60, right: 30 }}>
              <XAxis type='number' domain={[0, 100]} />
              <YAxis interval={0} dataKey='attributeLabel' type='category' />
              <Bar dataKey='proportion' fill='#8884d8' isAnimationActive={false}>
                {data.map((entry: PlotEntry, index: number) => (
                  <Cell
                    fill={entry.attributeLabel === active?.attributeLabel ? colors.active : colors.inactive}
                    key={`cell-${index}`}
                  />
                ))}
              </Bar>
              <Tooltip
                active={false}
                cursor={false}
                content={e => {
                  if (e.active && e.payload !== undefined) {
                    const newActive = e.payload[0].payload;
                    if (active?.attributeLabel !== newActive.attributeLabel) {
                      setActive(newActive);
                    }
                  }
                  if (!e.active) {
                    setActive(undefined);
                  }
                  return <></>;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
        <MetricsWrapper>
          <MetricsSpacing />
          <Metrics
            value={active ? kFormat(active.known) : '-'}
            title={'Available'}
            helpText={'Number of samples for which metadata information is available'}
            showPercent={active ? active.proportion.toFixed(2) : '-'}
          />
        </MetricsWrapper>
      </ChartAndMetricsWrapper>
    </Wrapper>
  );
};

export const MetadataAvailabilityPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    SequencingRepresentativenessSelectorSchema,
    async (decoded: Props) => decoded.selector,
    async encoded => ({
      selector: encoded,
    })
  ),
  MetadataAvailabilityPlot,
  'MetadataAvailabilityPlot'
);
