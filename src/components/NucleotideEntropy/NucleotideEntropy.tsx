import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import Loader from '../Loader';
import { LapisSelector } from '../../data/LapisSelector';
import { PipeDividedOptionsButtons } from '../../helpers/ui';
import { NamedCard } from '../NamedCard';
import {
  Bar,
  BarChart,
  Brush,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { SequenceType } from '../../data/SequenceType';
import { Form } from 'react-bootstrap';
import jsonRefData from '../../data/refData.json';
import { colors } from '../../widgets/common';
import { mapLabelsToColors } from '../../helpers/colors';
import chroma from 'chroma-js';
import Select, { ActionMeta, CSSObjectWithLabel, MultiValue, StylesConfig } from 'react-select';
import { formatDate } from '../../widgets/VariantTimeDistributionLineChartInner';
import { PercentageInput } from '../PercentageInput';
import { GeneOption } from './calculateEntropy';
import { CustomBar, CustomTooltip, formatXAxis, getBrushIndex } from './PlotUtils';
import { useNucleotideEntropyDataByPosition, useNucleotideEntropyDataByTime } from './hooks';
import { genes } from './genes';

type Props = {
  selector: LapisSelector;
};

type PlotType = 'overTime' | 'perPosition';

type ColorLabelValue = { color: string; label: string; value: string };

export type Gene = {
  name: string;
  startPosition: number;
  endPosition: number;
  aaSeq: string;
};

const toolTipStyle = {
  backgroundColor: 'white',
  zIndex: 1,
};

const colorStyles: Partial<StylesConfig<any, true, any>> = {
  control: (styles: CSSObjectWithLabel) => ({ ...styles, backgroundColor: 'white' }),
  multiValue: (styles: CSSObjectWithLabel, { data }: { data: GeneOption }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles: CSSObjectWithLabel, { data }: { data: GeneOption }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles: CSSObjectWithLabel, { data }: { data: GeneOption }) => {
    return {
      ...styles,
      'color': data.color,
      ':hover': {
        backgroundColor: data.color,
        color: 'white',
        cursor: 'pointer',
      },
    };
  },
};

function assignColorsToGeneOptions<T extends { label: string }>(options: T[]): (T & { color: string })[] {
  const colors = mapLabelsToColors(options.map(o => o.label));
  return options.map((o, i) => ({
    ...o,
    color: colors[i],
  }));
}

export const options: GeneOption[] = assignColorsToGeneOptions(
  genes.map(gene => {
    return {
      value: gene.name,
      label: gene.name,
      startPosition: gene.startPosition,
      endPosition: gene.endPosition,
      aaSeq: gene.aaSeq,
      color: chroma.random().darken().hex(),
    };
  })
);

export const NucleotideEntropy = ({ selector }: Props) => {
  const [plotType, setPlotType] = useState<PlotType>('overTime');
  const [includeDeletions, setIncludeDeletions] = useState<boolean>(false);
  const [includeZeroEntropyPositions, setIncludeZeroEntropyPositions] = useState<boolean>(false);
  const [sequenceType, setSequenceType] = useState<SequenceType>('nuc');
  const [threshold, setThreshold] = useState(0.00001);
  const [selectedGene, setSelectedGene] = useState<string>('all');
  const [selectedGeneOptions, setSelectedGenes] = useState<readonly ColorLabelValue[]>([
    {
      value: 'All',
      label: 'All',
      color: '#353B89',
    },
  ]);

  let selectedGenes = options.filter(geneOptions =>
    selectedGeneOptions.map(colorLabelValue => colorLabelValue.value).includes(geneOptions.value)
  );

  const onSelectedGenesChange = (
    value: MultiValue<ColorLabelValue>,
    { action }: ActionMeta<ColorLabelValue>
  ) => {
    if (action === 'clear') {
      value = [{ value: 'All', label: 'All', color: '#353B89' }];
    }
    setSelectedGenes(value);
  };

  let geneRange: Gene | undefined = jsonRefData.genes.find(gene => gene.name === selectedGene);

  if (plotType === 'perPosition') {
    return (
      <NamedCard title='Nucleotide Entropy'>
        <PerPositionControls
          sequenceType={sequenceType}
          onSequenceTypeSelect={setSequenceType}
          includeDeletions={includeDeletions}
          onIncludeDeletionsChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setIncludeDeletions(event.target.checked);
          }}
          onPlotTypeSelect={setPlotType}
          selectedGene={selectedGene}
          onSelectedGeneChange={event => setSelectedGene(event.target.value)}
          includeZeroEntropyPositions={includeZeroEntropyPositions}
          onIncludeZeroEntropyPositionsChange={event => setIncludeZeroEntropyPositions(event.target.checked)}
          threshold={threshold}
          onThresholdChange={setThreshold}
        />
        <PerPositionPlot
          selector={selector}
          sequenceType={sequenceType}
          includeDeletions={includeDeletions}
          includePositionsWithZeroEntropy={includeZeroEntropyPositions}
          threshold={threshold}
          geneRange={geneRange}
        />
      </NamedCard>
    );
  }

  return (
    <NamedCard title='Nucleotide Entropy'>
      <OverTimeControls
        sequenceType={sequenceType}
        onSequenceTypeSelect={setSequenceType}
        includeDeletions={includeDeletions}
        onIncludeDeletionsChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setIncludeDeletions(event.target.checked);
        }}
        onPlotTypeSelect={setPlotType}
        onSelectedGenesChange={onSelectedGenesChange}
        selectedGenes={selectedGeneOptions}
      />
      <OverTimePlot
        selector={selector}
        sequenceType={sequenceType}
        selectedGenes={selectedGenes}
        includeDeletions={includeDeletions}
      />
    </NamedCard>
  );
};

type ControlsProps = {
  sequenceType: SequenceType;
  onSequenceTypeSelect: Dispatch<SetStateAction<SequenceType>>;
  includeDeletions: boolean;
  onIncludeDeletionsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPlotTypeSelect: Dispatch<SetStateAction<PlotType>>;
};

function PerPositionControls(
  props: ControlsProps & {
    selectedGene: string;
    onSelectedGeneChange: (event: ChangeEvent<HTMLInputElement>) => void;
    includeZeroEntropyPositions: boolean;
    onIncludeZeroEntropyPositionsChange: (event: ChangeEvent<HTMLInputElement>) => void;
    threshold: number;
    onThresholdChange: (value: ((prevState: number) => number) | number) => void;
  }
) {
  return (
    <div className='mb-4'>
      <SequenceTypeSelector selected={props.sequenceType} onSelect={props.onSequenceTypeSelect} />
      <IncludeDeletionsCheckbox checked={props.includeDeletions} onChange={props.onIncludeDeletionsChange} />
      <PlotTypeSelector selected={'perPosition'} onSelect={props.onPlotTypeSelect} />
      <GeneSelector value={props.selectedGene} onChange={props.onSelectedGeneChange} />
      <IncludeZeroEntropyPositionsCheckbox
        checked={props.includeZeroEntropyPositions}
        onChange={props.onIncludeZeroEntropyPositionsChange}
      />
      <div className='flex mb-2'>
        <div className='mr-2'>Entropy display threshold:</div>
        <PercentageInput ratio={props.threshold} setRatio={props.onThresholdChange} className='mr-2' />
      </div>
      {props.includeZeroEntropyPositions && (
        <div>
          <p>
            Setting the entropy display threshold to 0 may lead to slower performance and too many positions
            to resolve at once in the plot. Zooming in via the brush control or gene selector displays the
            bars again.
          </p>
        </div>
      )}
    </div>
  );
}

function OverTimeControls(
  props: ControlsProps & {
    onSelectedGenesChange: (value: MultiValue<ColorLabelValue>, action: ActionMeta<ColorLabelValue>) => void;
    selectedGenes: readonly ColorLabelValue[];
  }
) {
  return (
    <div className='mb-4'>
      <SequenceTypeSelector selected={props.sequenceType} onSelect={props.onSequenceTypeSelect} />
      <IncludeDeletionsCheckbox checked={props.includeDeletions} onChange={props.onIncludeDeletionsChange} />
      <PlotTypeSelector selected={'overTime'} onSelect={props.onPlotTypeSelect} />
      <MultipleGenesSelector value={props.selectedGenes} onChange={props.onSelectedGenesChange} />
    </div>
  );
}

function SequenceTypeSelector(props: {
  selected: 'aa' | 'nuc';
  onSelect: (value: ((prevState: 'aa' | 'nuc') => 'aa' | 'nuc') | 'aa' | 'nuc') => void;
}) {
  return (
    <div className='mb-2 flex'>
      <PipeDividedOptionsButtons
        options={[
          { label: 'Nucleotides', value: 'nuc' },
          { label: 'Amino acids', value: 'aa' },
        ]}
        selected={props.selected}
        onSelect={props.onSelect}
      />
    </div>
  );
}

function IncludeDeletionsCheckbox(props: {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={props.checked}
            onChange={props.onChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        }
        label='Include deletions'
      />
    </FormGroup>
  );
}

function PlotTypeSelector(props: {
  selected: PlotType;
  onSelect: (
    value: ((prevState: 'overTime' | 'perPosition') => PlotType) | 'overTime' | 'perPosition'
  ) => void;
}) {
  return (
    <div className='mb-2 flex'>
      <PipeDividedOptionsButtons
        options={[
          { label: 'Entropy over time', value: 'overTime' },
          { label: 'Entropy per position', value: 'perPosition' },
        ]}
        selected={props.selected}
        onSelect={props.onSelect}
      />
    </div>
  );
}

function GeneSelector(props: { value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className=' w-72 flex mb-2'>
      <div className='mr-2'>Gene:</div>
      <Form.Control as='select' value={props.value} onChange={props.onChange} className='flex-grow' size='sm'>
        <option value='all'>All</option>
        {jsonRefData.genes.slice(0, -1).map(gene => (
          <option value={gene.name} key={gene?.name}>
            {gene.name}
          </option>
        ))}
      </Form.Control>
    </div>
  );
}

function MultipleGenesSelector(props: {
  onChange: (value: MultiValue<ColorLabelValue>, action: ActionMeta<ColorLabelValue>) => void;
  value: readonly ColorLabelValue[];
}) {
  return (
    <div className='flex mb-2'>
      <div className='mr-2'>Genes:</div>
      <Select
        closeMenuOnSelect={false}
        placeholder='Select genes...'
        isMulti
        options={options}
        styles={colorStyles}
        onChange={props.onChange}
        value={props.value}
      />
    </div>
  );
}

function IncludeZeroEntropyPositionsCheckbox(props: {
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={props.checked}
            onChange={props.onChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        }
        label='Include positions with zero entropy'
      />
    </FormGroup>
  );
}

type PerPositionPlotProps = {
  selector: LapisSelector;
  sequenceType: 'aa' | 'nuc';
  includeDeletions: boolean;
  includePositionsWithZeroEntropy: boolean;
  threshold: number;
  geneRange: Gene | undefined;
};

export const PerPositionPlot = ({
  selector,
  sequenceType,
  includeDeletions,
  includePositionsWithZeroEntropy,
  threshold,
  geneRange,
}: PerPositionPlotProps) => {
  const plotData = useNucleotideEntropyDataByPosition(
    selector,
    sequenceType,
    includeDeletions,
    includePositionsWithZeroEntropy
  );

  if (plotData === undefined) {
    return <Loader />;
  }

  const filteredEntropy = plotData.filter(positionEntropy => positionEntropy.entropy >= threshold);
  const startIndex = getBrushIndex(geneRange, filteredEntropy, sequenceType).startIndex;
  const stopIndex = getBrushIndex(geneRange, filteredEntropy, sequenceType).stopIndex;

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <BarChart
        key={(startIndex || 0) + (stopIndex || 0)} //This fixes a weird bug where the plot doesn't redraw when the brush indexes are changed
        width={500}
        height={500}
        data={filteredEntropy}
        barCategoryGap={0}
        barGap={0}
        margin={{
          top: 30,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey='position' tickFormatter={formatXAxis} />
        <YAxis ticks={[0, 0.5, 1]} />
        <Tooltip content={<CustomTooltip />} allowEscapeViewBox={{ y: true }} wrapperStyle={toolTipStyle} />
        <Legend />
        <Bar shape={CustomBar} dataKey='entropy' legendType='none'></Bar>
        <Brush
          dataKey='name'
          height={10}
          stroke={colors.active}
          travellerWidth={10}
          gap={10}
          startIndex={startIndex}
          endIndex={stopIndex}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

type OverTimePlotProps = {
  selector: LapisSelector;
  sequenceType: 'aa' | 'nuc';
  selectedGenes: GeneOption[];
  includeDeletions: boolean;
};

export const OverTimePlot = ({
  selector,
  sequenceType,
  selectedGenes,
  includeDeletions,
}: OverTimePlotProps) => {
  const plotData = useNucleotideEntropyDataByTime(selector, sequenceType, selectedGenes, includeDeletions);

  if (plotData === undefined) {
    return <Loader />;
  }

  return (
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
        <XAxis
          dataKey='day'
          scale='time'
          type='number'
          tickFormatter={formatDate}
          domain={[(dataMin: any) => dataMin, () => plotData.timeData[plotData.timeData.length - 1]?.day]}
          ticks={plotData.ticks}
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
        {selectedGenes.map((gene: GeneOption) => (
          <Line
            xAxisId='day'
            type='monotone'
            dataKey={gene.value}
            strokeWidth={3}
            dot={false}
            stroke={gene.color}
            isAnimationActive={false}
            key={gene.value}
            legendType='none'
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
