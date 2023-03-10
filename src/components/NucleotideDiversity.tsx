import React, { useState } from 'react';
//import styled from 'styled-components';
//import { MutationName } from './MutationName';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionEntry } from '../data/MutationProportionEntry';
import { LapisSelector } from '../data/LapisSelector';
//import { useResizeDetector } from 'react-resize-detector';
//import Checkbox from '@mui/material/Checkbox';
//import FormGroup from '@mui/material/FormGroup';
//import FormControlLabel from '@mui/material/FormControlLabel';
import { PipeDividedOptionsButtons } from '../helpers/ui';
//import { DeregistrationHandle, ExportManagerContext } from './CombinedExport/ExportManager';
//import download from 'downloadjs';
//import { csvStringify } from '../helpers/csvStringifyHelper';
//import { getConsensusSequenceFromMutations } from '../helpers/variant-consensus-sequence';
//import JSZip from 'jszip';
import { PercentageInput } from './PercentageInput';
import { NamedCard } from './NamedCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  TooltipProps,
  LineChart,
  Line,
} from 'recharts';
import { SequenceType } from '../data/SequenceType';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Form } from 'react-bootstrap';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import { globalDateCache } from '../helpers/date-cache';
import { FixedDateRangeSelector } from '../data/DateRangeSelector';
import { DateRange } from '../data/DateRange';
import { DecodedNucMuation, decodeNucMutation } from '../helpers/nuc-mutation';
import { decodeAAMutation, DecodedAAMutation } from '../helpers/aa-mutation';
import jsonRefData from '../data/refData.json';

export interface Props {
  selector: LapisSelector;
}

interface NucelotideDiversityProps {}

type PositionProportion = {
  mutation: string | undefined;
  proportion: number;
};

type PositionEntropy = {
  position: number;
  proportions: PositionProportion[];
  entropy: number;
};

type WeekEntropy = {
  week: DateRange;
  meanEntropy: number;
};

type Data = {
  positionEntropy: PositionEntropy[];
  timeData: WeekEntropy[];
}

type Gene = {
  name: string;
  startPosition: number;
  endPosition: number;
  aaSeq: string;
}

const toolTipStyle = {
  backgroundColor: 'white',
  zIndex: 1,
};

export const NucleotideDiversity = ({ selector }: Props) => {
  const [plotType, setPlotType] = useState<string>('pos');
  const [sequenceType, setSequenceType] = useState<SequenceType>('nuc');
  const [threshold, setThreshold] = useState(0.01);
  const [gene, setGene] = useState<string>('all');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {};

  const data = useData(selector, sequenceType, gene);

  const controls = (
    <div className='mb-4'>
      {/*PLot type*/}
      <div className='mb-2 flex'>
        <PipeDividedOptionsButtons
          options={[
            { label: 'Entropy per position', value: 'pos' },
            { label: 'Entropy over time', value: 'time' },
          ]}
          selected={plotType}
          onSelect={setPlotType}
        />
      </div>
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
      <div className=' w-72 flex mb-2'>
        <div className='mr-2'>Gene:</div>
        <Form.Control
          as='select'
          value={gene}
          onChange={ev => setGene(ev.target.value)}
          className='flex-grow'
          size='sm'
        >
          <option value='all'>All</option>
          {ReferenceGenomeService.genes.map(g => (
            <option value={g} key={g}>
              {g}
            </option>
          ))}
        </Form.Control>
      </div>
      {/*Minimum entropy treshold to display*/}
      <div className='flex mb-2'>
        <div className='mr-2'>Entropy display threshold: </div>
        <PercentageInput ratio={threshold} setRatio={setThreshold} className='mr-2' />
      </div>
    </div>
  );

  let geneRange: Gene | undefined = jsonRefData.genes.find(g => g.name == gene);

  let plotArea;
  if (!data) {
    plotArea = <Loader />;
  } else {
  plotArea = (
    <Plot
      threshold={threshold}
      plotData={data}
      plotType={plotType}
      sequenceType={sequenceType}
      gene={geneRange}
    />
  );
  }

  return (
    <>
      <NamedCard title='Nucleotide Diversity'>
        <h3>
          Mean nucleotide entropy of all sequences:{' '}
          <b>{MeanNucleotideEntropy(data.positionEntropy).toFixed(6)}</b>
        </h3>
        {controls}
        {plotArea}
      </NamedCard>
    </>
  );
};

const useData = (selector: LapisSelector, sequenceType: SequenceType, gene: string) => {
  
  //fetch the proportions per position over the whole date range
  const mutationProportionEntriesQuery = useQuery(
    async signal => {
      return {
        sequencyType: sequenceType,
        result: await Promise.all([MutationProportionData.fromApi(selector, sequenceType, signal, 0)]).then(
        async ([data]) => {
          const proportions: MutationProportionEntry[] = data.payload.map(m => m);
          return {
            proportions,
          };
        }
      )
      };
    },
    [selector, sequenceType]
  );
  const proportionEntries = mutationProportionEntriesQuery.data?.result.proportions ?? undefined;

  // Fetch the date distribution of the variant
  const basicVariantDataQuery = useQuery(
    async signal => ({
      sequenceType,
      result: await Promise.all([DateCountSampleData.fromApi(selector, signal)]),
    }),
    [selector, sequenceType]
  );
  const [variantDateCounts] = basicVariantDataQuery.data?.result ?? [undefined];

  //fetch the proportions per position in weekly segments
  const weeklyMutationProportionQuery = useQuery(
    async signal => {
      if (!variantDateCounts) {
        return undefined;
      }

      //calculate weeks
      const dayRange = globalDateCache.rangeFromDays(
        variantDateCounts.payload.filter(v => v.date).map(v => v.date!)
      )!;
      const weeks = globalDateCache.weeksFromRange({ min: dayRange.min.isoWeek, max: dayRange.max.isoWeek });
      const weekDateRanges = new Array<DateRange>();
      for (let i = 0; i < weeks.length; i++) {
        let dateRange: DateRange = { dateFrom: weeks[i].firstDay, dateTo: weeks[i].firstDay };
        weekDateRanges[i] = dateRange;
      }

      const weekSelectors: LapisSelector[] = weekDateRanges.map(w => ({
        ...selector,
        dateRange: new FixedDateRangeSelector(w),
      }));

      return Promise.all(
        weekSelectors.map((w, i) =>
          MutationProportionData.fromApi(w, sequenceType, signal, 0).then(data => {
            const proportions: MutationProportionEntry[] = data.payload.map(m => m);
            let date = weekDateRanges[i];
            return {
              proportions,
              date,
            };
          })
        )
      );
    },
    [selector, variantDateCounts]
  );

  let positionEntropy = CalculateNucEntropy(proportionEntries, sequenceType)

  let weeklyData = weeklyMutationProportionQuery.data
  const timeData = WeeklyMeanEntropy(weeklyData, sequenceType);

  let data: Data = {positionEntropy: positionEntropy, timeData: timeData}
  return data;
};

type PlotProps = {
  threshold: number;
  plotData: Data;
  plotType: string;
  sequenceType: SequenceType
  gene: Gene | undefined
};

const Plot = ({ threshold, plotData, plotType, sequenceType, gene }: PlotProps) => {
  console.log(plotData.positionEntropy)
  if (plotType == 'pos') {
    return (
      <>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            width={500}
            height={500}
            data={plotData.positionEntropy.filter(p => p.entropy >= threshold)}
            barCategoryGap={0}
            barGap={0}
            margin={{
              top: 30,
              right: 20,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey='position'/>
            <YAxis domain={[0, 1]} />
            <Tooltip
              content={<CustomTooltip />}
              allowEscapeViewBox={{ y: true }}
              wrapperStyle={toolTipStyle}
            />
            <Legend />
            <Bar dataKey='entropy' fill='#000000' legendType='none'/>
            <Brush dataKey='name' height={20} stroke='#000000' travellerWidth={10} gap={10} startIndex={gene?.startPosition} endIndex={gene?.endPosition}/>
          </BarChart>
        </ResponsiveContainer>
      </>
    );
  } else {
    let transformedData = plotData.timeData
      .filter(t => t.meanEntropy > 0)
      .map(({ week, meanEntropy }) => {
        return { day: week.dateFrom?.string, entropy: meanEntropy };
      });
    return (
      <>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            width={500}
            height={500}
            data={transformedData}
            margin={{
              top: 30,
              right: 20,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='day' />
            <YAxis type='number' domain={[0, 'dataMax']} />
            <Tooltip
              formatter={(value: string) => [Number(value).toFixed(6), 'Mean entropy']}
              labelFormatter={label => {
                return 'Week starting on: ' + label;
              }}
            />
            <Legend />
            <Line type='monotone' dataKey='entropy' stroke='#000000' legendType='none' />
          </LineChart>
        </ResponsiveContainer>
      </>
    );
  }
};

const CalculateNucEntropy = (
  nucs: MutationProportionEntry[] | undefined,
  sequenceType: SequenceType
): PositionEntropy[] => {
  let positionProps = Array.apply(null, Array<PositionEntropy>(29903)).map(function (x, i) {
    let p: PositionEntropy = { position: i, proportions: [], entropy: 0 };
    return p;
  });

  //sort proportions to their positions
  nucs?.forEach(nuc => {
    let decoded = decodeMutation(nuc.mutation, sequenceType);
    let position = decoded.position;
    let mutation = decoded.mutatedBase;
    let reference = decoded.originalBase;
    let proportion = nuc.proportion;
    if (mutation != '-') {
      let pp: PositionProportion = { mutation: mutation, proportion: proportion };
      positionProps[position - 1].proportions.push(pp);
    }
  });

  //calculate remaining original nucleotide proportion
  positionProps.forEach(pos => {
    let propSum = 0;
    pos.proportions.forEach(p => (propSum += p.proportion));
    let remainder = 1 - propSum;
    if (remainder != 0) {
      let pp: PositionProportion = { mutation: 'ref', proportion: remainder }; //set reference flag as mutation, so it can later be displayed correctly
      pos.proportions.push(pp);
    }
  });

  //convert nucleotide proportion to entropy
  positionProps.map(p => {
    let sum = 0;
    p.proportions.forEach(pp => (sum += pp.proportion * Math.log(pp.proportion)));
    p.entropy = -sum;
  });

  return positionProps;
};

const MeanNucleotideEntropy = (posEntropy: PositionEntropy[]): number => {
  let sum = 0;
  posEntropy?.forEach(e => (sum += e.entropy));
  return sum / posEntropy?.length || 0;
};

const WeeklyMeanEntropy = (
  weeks: { proportions: MutationProportionEntry[]; date: DateRange }[] | undefined,
  sequenceType: SequenceType
): WeekEntropy[] => {
  let means = new Array<WeekEntropy>();
  weeks?.forEach(w =>
    means.push({ week: w.date, meanEntropy: MeanNucleotideEntropy(CalculateNucEntropy(w.proportions, sequenceType)) })
  );
  return means;
};

const decodeMutation = (
  mutation: string,
  sequenceType: SequenceType
): DecodedNucMuation | DecodedAAMutation => {
  if (sequenceType == 'nuc') {
    return decodeNucMutation(mutation);
  } else {
    return decodeAAMutation(mutation);
  }
};
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active) {
    return (
      <div className='recharts-tooltip-wrapper recharts-tooltip-wrapper-left recharts-tooltip-wrapper-top custom-tooltip'>
        <p style={{ paddingLeft: 10 }} className='label'>
          Position: <b>{label}</b>
        </p>
        <p style={{ paddingLeft: 10 }}>
          Entropy: <b>{Number(payload?.[0].value).toFixed(5)}</b>
        </p>

        <p style={{ paddingLeft: 10, paddingRight: 10 }}>Nucleotide proportions:</p>
        {payload?.[0].payload?.proportions.map((pld: any) => (
          <div style={{ display: 'inline-block', paddingLeft: 10, paddingRight: 10, paddingBottom: 10 }}>
            <div>
              <b>{pld.mutation}</b> : {pld.proportion.toFixed(5)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};