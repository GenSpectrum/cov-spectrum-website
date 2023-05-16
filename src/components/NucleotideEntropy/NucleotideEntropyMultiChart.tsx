import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import Loader from '../Loader';
import { LapisSelector } from '../../data/LapisSelector';
import { PipeDividedOptionsButtons } from '../../helpers/ui';
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { SequenceType } from '../../data/SequenceType';
import { Form } from 'react-bootstrap';
import jsonRefData from '../../data/refData.json';
import { GeneOption } from './calculateEntropy';
import { useExploreUrl } from '../../helpers/explore-url';
import { pprettyColors } from '../../helpers/colors';
import { formatDate } from '../../widgets/VariantTimeDistributionLineChartInner';
import { genes } from './genes';
import { useMultiChartData } from './useMultiChartData';

type Props = {
  selectors: LapisSelector[];
};

function nonNullValuesToString(obj: object) {
  return Object.entries(obj)
    .filter(([_, value]) => value !== undefined)
    .map(([_, value]) => value)
    .toString();
}

export const NucleotideEntropyMultiChart = ({ selectors }: Props) => {
  const [sequenceType, setSequenceType] = useState<SequenceType>('nuc');
  const [selectedGene, setSelectedGene] = useState<string>('All');
  const [includeDeletions, setIncludeDeletions] = useState<boolean>(false);

  const handleDeletions = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeDeletions(event.target.checked);
  };

  const exploreUrl = useExploreUrl()!;
  const variants = (exploreUrl.variants ?? []).map(nonNullValuesToString);

  let selectedGeneOptions = genes
    .filter(gene => gene.name === selectedGene)
    .map(gene => {
      return {
        value: gene.name,
        label: gene.name,
        startPosition: gene.startPosition,
        endPosition: gene.endPosition,
        aaSeq: gene.aaSeq,
        color: '',
      };
    });

  return (
    <>
      <Controls
        sequenceType={sequenceType}
        onSequenceTypeSelect={setSequenceType}
        includeDeletions={includeDeletions}
        onIncludeDeletionsChange={handleDeletions}
        selectedGene={selectedGene}
        onSelectedGeneChange={event => setSelectedGene(event.target.value)}
      />
      <Plot
        selectors={selectors}
        selectedGeneOptions={selectedGeneOptions}
        variants={variants}
        sequenceType={sequenceType}
        includeDeletions={includeDeletions}
      />
    </>
  );
};

function Controls(props: {
  sequenceType: SequenceType;
  onSequenceTypeSelect: Dispatch<SetStateAction<SequenceType>>;
  includeDeletions: boolean;
  onIncludeDeletionsChange: (event: ChangeEvent<HTMLInputElement>) => void;
  selectedGene: string;
  onSelectedGeneChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className='mb-4'>
      <div className='mb-2 flex'>
        <PipeDividedOptionsButtons
          options={[
            { label: 'Nucleotide', value: 'nuc' },
            { label: 'Amino Acids', value: 'aa' },
          ]}
          selected={props.sequenceType}
          onSelect={props.onSequenceTypeSelect}
        />
      </div>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.includeDeletions}
              onChange={props.onIncludeDeletionsChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          }
          label='Include deletions'
        />
      </FormGroup>
      <div className=' w-72 flex mb-2'>
        <div className='mr-2'>Gene:</div>
        <Form.Control
          as='select'
          value={props.selectedGene}
          onChange={props.onSelectedGeneChange}
          className='flex-grow'
          size='sm'
        >
          {jsonRefData.genes.map(gene => (
            <option value={gene.name} key={gene.name}>
              {gene.name}
            </option>
          ))}
        </Form.Control>
      </div>
    </div>
  );
}

type PlotProps = {
  selectors: LapisSelector[];
  selectedGeneOptions: GeneOption[];
  variants: string[];
  sequenceType: SequenceType;
  includeDeletions: boolean;
};

const Plot = ({ selectors, selectedGeneOptions, variants, sequenceType, includeDeletions }: PlotProps) => {
  const data = useMultiChartData(selectors, selectedGeneOptions, variants, sequenceType, includeDeletions);

  if (variants![0].length === 0) {
    return <p>Select one or more lineages to compare.</p>;
  }

  if (!data) {
    return <Loader />;
  }

  return (
    <>
      <ResponsiveContainer width='100%' height={200}>
        <LineChart
          key={sequenceType}
          width={500}
          height={500}
          data={data.plotData}
          margin={{
            top: 30,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey='day'
            scale='time'
            type='number'
            tickFormatter={formatDate}
            domain={[(dataMin: any) => dataMin, () => data.plotData[data.plotData.length - 1].day]}
            ticks={data.ticks}
            xAxisId='day'
          />
          <YAxis />
          <Tooltip
            formatter={(value: string) => Number(value).toFixed(6)}
            labelFormatter={label => {
              return 'Week starting on: ' + formatDate(label);
            }}
          />
          <Legend />
          {variants.sort().map((variant, i) => (
            <Line
              key={variant}
              xAxisId='day'
              type='monotone'
              dataKey={variant}
              strokeWidth={3}
              dot={false}
              stroke={pprettyColors[i]}
              isAnimationActive={false}
              legendType='none'
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};
