import React, { useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Utils } from '../services/Utils';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from './common';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Text, Cell } from 'recharts';
import Metrics, { MetricsWrapper } from './Metrics';
import { kFormat } from '../helpers/number';
import { CaseCountDataset } from '../data/CaseCountDataset';
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { CaseCountEntry } from '../data/CaseCountEntry';
import { DetailedSampleAggEntry } from '../data/sample/DetailedSampleAggEntry';

export type SequencingRepresentativenessChartProps = {
  caseDataset: CaseCountDataset;
  sampleDataset: DetailedSampleAggDataset;
};

type PlotEntry = {
  key: string;
  proportion?: number;
  sequenced: number;
  cases: number;
};

export type Attribute = 'division' | 'age' | 'sex' | 'hospitalized' | 'died';

// It does not make sense to analyze age, sex, hospitalized and died because these information
// is only available for less than half of the data
export const attributes: {
  key: Attribute;
  label: string;
}[] = [
  { key: 'division', label: 'Division' },
  // { key: 'age', label: 'Age' },
  // { key: 'sex', label: 'Sex' },
  // { key: 'hospitalized', label: 'Hospitalization status' },
  // { key: 'died', label: 'Death status' },
];

function prepareCountsData(
  counts: (CaseCountEntry | DetailedSampleAggEntry)[],
  attributes: Attribute[]
): Map<string, number> {
  const grouped = Utils.groupBy(counts, el => {
    const keyValues = [];
    for (let attribute of attributes) {
      const value = el[attribute];
      if (value === null) {
        return '';
      }
      if (attribute === 'hospitalized') {
        keyValues.push(value ? 'hospitalized' : 'not hospitalized');
      } else if (attribute === 'died') {
        keyValues.push(value ? 'died' : 'not died');
      } else {
        keyValues.push(value);
      }
    }
    return keyValues.join('/');
  });
  const aggregated: [string, number][] = [...grouped.entries()]
    .filter(([key]) => key !== '')
    .map(([key, entries]) => [
      key,
      entries.reduce((count, entry) => {
        if ('count' in entry) {
          return count + entry.count;
        } else {
          return count + entry.newCases;
        }
      }, 0),
    ]);
  aggregated.sort(([key1], [key2]) => (key1 < key2 ? -1 : 1));
  return new Map(aggregated);
}

export const SequencingRepresentativenessChart = React.memo(
  ({ caseDataset, sampleDataset }: SequencingRepresentativenessChartProps) => {
    const [active, setActive] = useState<undefined | PlotEntry>(undefined);
    const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>(['division']);

    const data = useMemo(() => {
      const caseCountsByField = prepareCountsData(caseDataset.getPayload(), selectedAttributes);
      const sampleCountsByField = prepareCountsData(sampleDataset.getPayload(), selectedAttributes);
      const _data: PlotEntry[] = [];
      for (let [key, cases] of caseCountsByField) {
        const sequenced = sampleCountsByField.get(key)!;
        _data.push({
          key,
          cases,
          sequenced,
          proportion: cases > 0 ? sequenced / cases : undefined,
        });
      }
      return _data;
    }, [caseDataset, sampleDataset, selectedAttributes]);

    const YAxisLeftTick = ({ y, payload: { value } }: any) => {
      return (
        <Text x={300} y={y} textAnchor='end' verticalAnchor='middle'>
          {value}
        </Text>
      );
    };

    const selectOrUnselectAttribute = (attribute: Attribute) => {
      // Only up to up attributes may be selected at the same time
      // If a third item is being checked, the first will be unchecked
      const [first, second] = selectedAttributes;
      if (attribute === first) {
        setSelectedAttributes([second]);
      } else if (attribute === second) {
        setSelectedAttributes([first]);
      } else if (!first) {
        setSelectedAttributes([attribute]);
      } else if (!second) {
        setSelectedAttributes([first, attribute]);
      } else {
        setSelectedAttributes([second, attribute]);
      }
    };

    return (
      <div className='flex h-full'>
        <div>
          {/*<div>Select up to two attributes:</div>*/}
          {attributes.map(({ key, label }) => (
            <Form.Check
              key={key}
              type='checkbox'
              id={key + '-checkbox'}
              label={label}
              checked={selectedAttributes.includes(key)}
              onChange={() => selectOrUnselectAttribute(key)}
            />
          ))}
        </div>
        <div className='flex-grow overflow-auto'>
          {
            <div style={{ height: `${30 + data.length * 25}px` }} key={data.length}>
              <Wrapper>
                <ChartAndMetricsWrapper>
                  <ChartWrapper className='-mr-4 -ml-1'>
                    <ResponsiveContainer>
                      <BarChart data={data} layout='vertical' margin={{ left: 250, right: 50 }}>
                        <XAxis type='number' tickFormatter={tick => `${tick}%`} />
                        <YAxis interval={0} dataKey='key' type='category' tick={YAxisLeftTick} />
                        <Bar dataKey='proportion' isAnimationActive={false}>
                          {data.map((entry: PlotEntry, index: number) => (
                            <Cell
                              fill={entry.key === active?.key ? colors.active : colors.inactive}
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
                              if (active?.key !== newActive.key) {
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
                </ChartAndMetricsWrapper>
              </Wrapper>
            </div>
          }
        </div>
        <div className='h-full flex'>
          <MetricsWrapper className='ml-10'>
            <Metrics
              value={active ? kFormat(active.cases) : '-'}
              title={'Confirmed'}
              helpText={'Number of confirmed cases'}
            />
            <Metrics
              value={active ? kFormat(active.sequenced) : '-'}
              title={'Sequenced'}
              helpText={'Number of samples sequenced among the confirmed cases'}
              showPercent={active && active.proportion ? active.proportion.toFixed(2) : '-'}
            />
          </MetricsWrapper>
        </div>
      </div>
    );
  }
);
