import React, { useState } from 'react';
// import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
// import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
// import { useQuery } from '../helpers/query-hook';
// import { MutationProportionEntry } from '../data/MutationProportionEntry';
import { LapisSelector } from '../data/LapisSelector';
import { PipeDividedOptionsButtons } from '../helpers/ui';
// import { NamedCard } from './NamedCard';
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, } from 'recharts';
import { SequenceType } from '../data/SequenceType';
// import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Form } from 'react-bootstrap';
// import { globalDateCache } from '../helpers/date-cache';
// import { FixedDateRangeSelector } from '../data/DateRangeSelector';
// import { DateRange } from '../data/DateRange';
// import { decodeNucMutation } from '../helpers/nuc-mutation';
// import { decodeAAMutation, sortListByAAMutation } from '../helpers/aa-mutation';
import jsonRefData from '../data/refData.json';
import { colors } from '../widgets/common';
// import { mapLabelsToColors } from '../helpers/colors';
// import chroma from 'chroma-js';
// import Select, { CSSObjectWithLabel, StylesConfig } from 'react-select';
import { Data, GeneOption, useEntropyData } from './NucleotideEntropy';

type Props = {
    selectors: LapisSelector[];
  };

const genes = jsonRefData.genes;
!genes.map(o => o.name).includes('All') &&
  genes.push({ name: 'All', startPosition: 0, endPosition: 29903, aaSeq: ''});

export const NucleotideEntropyMultiChart = ({ selectors }: Props) => {
    const [sequenceType, setSequenceType] = useState<SequenceType>('nuc');
    const [gene, setGene] = useState<string>('All');

    let selectedGene: GeneOption[] = genes.filter(g => g.name === gene).map(g => {
        return {
            value: g.name,
            label: g.name,
            startPosition: g.startPosition,
            endPosition: g.endPosition,
            aaSeq: g.aaSeq,
            color: ''
          };
    })
    console.log(selectedGene);

    const data = useEntropyData(selectors[0], "nuc", selectedGene)

    console.log(data?.timeData);

    const controls = (
        <div className='mb-4'>
          {/* AA vs. nucs */}
          <div className='mb-2 flex'>
            <PipeDividedOptionsButtons
              options={[
                { label: 'NUC', value: 'nuc' },
                { label: 'AA', value: 'aa' },
              ]}
              selected={sequenceType}
              onSelect={setSequenceType}
            />
          </div>
          {/* Genes */}
          {
            <div className=' w-72 flex mb-2'>
              <div className='mr-2'>Gene:</div>
              <Form.Control
                as='select'
                value={gene}
                onChange={ev => setGene(ev.target.value)}
                className='flex-grow'
                size='sm'
              >
                {jsonRefData.genes.map(g => (
                  <option value={g.name} key={g?.name}>
                    {g.name}
                  </option>
                ))}
              </Form.Control>
            </div>
          }
        </div>
    );

    let plotArea;
    if (!data) {
        plotArea = <Loader />;
    } else {
        plotArea = (
        <Plot
            plotData={data}
        />
        );
    }
    
    return (
        <>
        {controls}
        {plotArea}
        </>
      );
}

type PlotProps = {
    plotData: Data;
};

const Plot = ({ plotData }: PlotProps) => {
return (
    <>
    <ResponsiveContainer width='100%' height='100%'>
        <LineChart
        width={500}
        height={500}
        data={plotData.timeData}
        margin={{
            top: 30,
            right: 20,
            left: 20,
            bottom: 5,
        }}
        >
        <XAxis dataKey='day' />
        <YAxis  />
        <Tooltip
            formatter={(value: string) => Number(value).toFixed(6)}
            labelFormatter={label => {
            return 'Week starting on: ' + label;
            }}
        />
        <Legend />
        <Line
            type='monotone'
            dataKey='All'
            strokeWidth={3}
            dot={false}
            stroke={colors.active}
            isAnimationActive={false}
            key=''
            legendType='none'
            />
        {/* {selectedGenes.map((gene: GeneOption) => (
            <Line
            type='monotone'
            dataKey={gene.value}
            strokeWidth={3}
            dot={false}
            stroke={gene.color}
            isAnimationActive={false}
            key={gene.value}
            legendType='none'
            />
        ))} */}
        </LineChart>
    </ResponsiveContainer>
    </>
)
}