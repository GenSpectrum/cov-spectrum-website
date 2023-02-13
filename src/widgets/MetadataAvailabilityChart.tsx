import React, { useMemo, useState } from 'react';
import { ChartAndMetricsWrapper, ChartWrapper, colors, TitleWrapper, Wrapper } from './common';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Metrics, { MetricsWrapper } from './Metrics';
import { kFormat } from '../helpers/number';
import { DatelessCountrylessCountSampleDataset } from '../data/sample/DatelessCountrylessCountSampleDataset';
import { TooltipSideEffect } from '../components/RechartsTooltip';

export type MetadataAvailabilityChartProps = {
  sampleSet: DatelessCountrylessCountSampleDataset;
};

type PlotEntry = {
  attributeLabel: string;
  proportion: number;
  known: number;
  unknown: number;
};

type Attribute = 'division' | 'age' | 'sex' | 'hospitalized' | 'died';
const attributes: {
  key: Attribute;
  label: string;
}[] = [
  { key: 'division', label: 'Division' },
  { key: 'age', label: 'Age' },
  { key: 'sex', label: 'Sex' },
  { key: 'hospitalized', label: 'Hospitalization status' },
  { key: 'died', label: 'Death status' },
];

export const MetadataAvailabilityChart = ({ sampleSet }: MetadataAvailabilityChartProps) => {
  const [active, setActive] = useState<undefined | PlotEntry>(undefined);

  const data: PlotEntry[] = useMemo(() => {
    let total = 0;
    const knownOfAttribute: Map<Attribute, number> = new Map(attributes.map(({ key }) => [key, 0]));
    for (const entry of sampleSet.payload) {
      total += entry.count;
      for (let { key } of attributes) {
        if (entry[key] !== null) {
          knownOfAttribute.set(key, knownOfAttribute.get(key)! + entry.count);
        }
      }
    }
    return attributes.map(({ key, label }) => ({
      attributeLabel: label,
      proportion: (knownOfAttribute.get(key)! / total) * 100,
      known: knownOfAttribute.get(key)!,
      unknown: total - knownOfAttribute.get(key)!,
    }));
  }, [sampleSet]);

  return (
    <Wrapper>
      <TitleWrapper id='graph_title'>
        Proportion of sequences for which we have metadata information
      </TitleWrapper>

      {data && (
        <ChartAndMetricsWrapper>
          <ChartWrapper className='-mr-4 -ml-1'>
            <ResponsiveContainer>
              <BarChart
                layout='vertical'
                data={data}
                margin={{
                  left: 60,
                  right: 30,
                }}
              >
                <XAxis type='number' domain={[0, 100]} tickFormatter={tick => `${tick}%`} />
                <YAxis interval={0} dataKey='attributeLabel' type='category' />
                <Bar dataKey='proportion' isAnimationActive={false}>
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
                  content={tooltipProps => {
                    return (
                      <TooltipSideEffect
                        tooltipProps={tooltipProps}
                        sideEffect={tooltipProps => {
                          if (tooltipProps.active && tooltipProps.payload !== undefined) {
                            const newActive = tooltipProps.payload[0].payload;
                            if (active?.attributeLabel !== newActive.attributeLabel) {
                              setActive(newActive);
                            }
                          }
                          if (!tooltipProps.active) {
                            setActive(undefined);
                          }
                        }}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <MetricsWrapper>
            <Metrics
              value={active ? kFormat(active.known) : '-'}
              title={'Available'}
              helpText={'Number of samples for which metadata information is available'}
              showPercent={active ? active.proportion.toFixed(2) : '-'}
            />
          </MetricsWrapper>
        </ChartAndMetricsWrapper>
      )}
    </Wrapper>
  );
};
