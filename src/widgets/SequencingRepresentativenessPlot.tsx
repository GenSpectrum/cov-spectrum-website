import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import {
  CaseCountEntry,
  SequenceCountEntry,
  SequencingRepresentativenessSelector,
  SequencingRepresentativenessSelectorSchema,
} from '../services/api-types';
import React, { useEffect, useState } from 'react';
import { getCaseCounts, getSequenceCounts } from '../services/api';
import { Form } from 'react-bootstrap';
import { Utils } from '../services/Utils';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from '../charts/common';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Text, Cell } from 'recharts';
import Metrics, { MetricsWrapper } from '../charts/Metrics';
import Loader from '../components/Loader';
import { kFormat } from '../helpers/number';

interface Props {
  selector: SequencingRepresentativenessSelector;
}

interface PlotEntry {
  key: string;
  proportion?: number;
  sequenced: number;
  cases: number;
}

type Attribute = 'division' | 'ageGroup' | 'sex' | 'hospitalized' | 'deceased';

const attributes: {
  key: Attribute;
  label: string;
}[] = [
  { key: 'division', label: 'Division' },
  { key: 'ageGroup', label: 'Age group' },
  { key: 'sex', label: 'Sex' },
  { key: 'hospitalized', label: 'Hospitalized' },
  { key: 'deceased', label: 'Deceased' },
];

function prepareCountsData(
  counts: CaseCountEntry[] | SequenceCountEntry[],
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
      } else if (attribute === 'deceased') {
        keyValues.push(value ? 'died' : 'not died');
      } else {
        keyValues.push(value);
      }
    }
    return keyValues.join('/');
  });
  const aggregated: [string, number][] = [...grouped.entries()]
    .filter(([key]) => key !== '')
    .map(([key, entries]) => [key, entries.reduce((count, entry) => count + entry.count, 0)]);
  aggregated.sort(([key1], [key2]) => (key1 < key2 ? -1 : 1));
  return new Map(aggregated);
}

export const SequencingRepresentativenessPlot = React.memo(({ selector }: Props) => {
  const [data, setData] = useState<undefined | PlotEntry[]>(undefined);
  const [active, setActive] = useState<undefined | PlotEntry>(undefined);
  const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>(['division']);

  useEffect(() => {
    const caseCountsPromise = getCaseCounts(selector).then(counts =>
      prepareCountsData(counts, selectedAttributes)
    );
    const sequenceCountsPromise = getSequenceCounts(selector).then(counts =>
      prepareCountsData(counts, selectedAttributes)
    );
    Promise.all([caseCountsPromise, sequenceCountsPromise]).then(([caseCounts, sequenceCounts]) => {
      const _data: PlotEntry[] = [];
      for (let [key, cases] of caseCounts) {
        const sequenced = sequenceCounts.get(key) ?? 0;
        const proportion = cases > 0 ? (sequenced / cases) * 100 : undefined;
        _data.push({
          key,
          cases,
          sequenced,
          proportion,
        });
      }
      setData(_data);
    });
  }, [selector, selectedAttributes]);

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
        <div>Select up to two attributes:</div>
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
        {!data && <Loader />}
        {data && (
          <div style={{ height: `${data.length * 25}px` }} key={data.length}>
            <Wrapper>
              <ChartAndMetricsWrapper>
                <ChartWrapper className='-mr-4 -ml-1'>
                  <ResponsiveContainer>
                    <BarChart data={data} layout='vertical' margin={{ left: 250, right: 50 }}>
                      <XAxis type='number' />
                      <YAxis interval={0} dataKey='key' type='category' tick={YAxisLeftTick} />
                      <Bar dataKey='proportion' fill='#8884d8' isAnimationActive={false}>
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
        )}
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
});

export const SequencingRepresentativenessPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    SequencingRepresentativenessSelectorSchema,
    async (decoded: Props) => decoded.selector,
    async encoded => ({
      selector: encoded,
    })
  ),
  SequencingRepresentativenessPlot,
  'SequencingRepresentativenessPlot'
);
