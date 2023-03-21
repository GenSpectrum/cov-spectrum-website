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
import { globalDateCache } from '../helpers/date-cache';
import { FixedDateRangeSelector } from '../data/DateRangeSelector';
import { DateRange } from '../data/DateRange';
import { decodeNucMutation } from '../helpers/nuc-mutation';
import { decodeAAMutation, sortListByAAMutation } from '../helpers/aa-mutation';
import jsonRefData from '../data/refData.json';

type Props = {
  selector: LapisSelector;
};

type PositionProportion = {
  position: string;
  mutation: string | undefined;
  proportion: number;
};

type PositionEntropy = {
  position: string;
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

  const data = useData(selector, sequenceType);

  const controls = (
    <div className='mb-4'>
      {/*Plot type*/}
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
      {plotType === 'pos' && (
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
          {jsonRefData.genes.map(g => (
            <option value={g.name} key={g?.name}>
              {g.name}
            </option>
          ))}
        </Form.Control>
      </div>)}
      {/*Minimum entropy treshold to display*/}
      {plotType === 'pos' && (
      <div className='flex mb-2'>
        <div className='mr-2'>Entropy display threshold: </div>
        <PercentageInput ratio={threshold} setRatio={setThreshold} className='mr-2' />
      </div>)}
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
          <b>{MeanEntropy(data.positionEntropy, sequenceType).toFixed(6)}</b>
        </h3>
        {controls}
        {plotArea}
      </NamedCard>
    </>
  );
};

const useData = (selector: LapisSelector, sequenceType: SequenceType) => {
  //fetch the proportions per position over the whole date range
  const mutationProportionEntriesQuery = useQuery(
    async signal => {
      return {
        sequencyType: sequenceType,
        result: await Promise.all([
          MutationProportionData.fromApi(selector, sequenceType, signal)
        ]).then(async ([data]) => {
          const proportions: MutationProportionEntry[] = data.payload.map(m => m);
          return {
            proportions
          };
        }
      )};
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
          MutationProportionData.fromApi(w, sequenceType, signal).then(data => {
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
    [selector, sequenceType, variantDateCounts]
  );

  let positionEntropy = CalculateEntropy(proportionEntries, sequenceType)
  const timeData = WeeklyMeanEntropy(weeklyMutationProportionQuery.data, sequenceType);

  if (positionEntropy[0]?.position.includes(":")){
    const sorted = sortListByAAMutation(positionEntropy, m => m.position);
    positionEntropy = sorted;
  }

  const data: Data = {positionEntropy: positionEntropy, timeData: timeData}
  return data;
};

type PlotProps = {
  threshold: number;
  plotData: Data;
  plotType: string;
  sequenceType: SequenceType;
  gene: Gene | undefined;
};

const Plot = ({ threshold, plotData, plotType, sequenceType, gene }: PlotProps) => {
  if (plotType == 'pos') {
    let transformedData = plotData.positionEntropy.filter(p => p.entropy >= threshold);
    return (
      <>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            width={500}
            height={500}
            data={transformedData}
            barCategoryGap={0}
            barGap={0}
            margin={{
              top: 30,
              right: 20,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey='position' tickFormatter={formatXAxis}/>
            <YAxis ticks={[0, 0.5, 1]} />
            <Tooltip
              content={<CustomTooltip />}
              allowEscapeViewBox={{ y: true }}
              wrapperStyle={toolTipStyle}
            />
            <Legend />
            <Bar dataKey='entropy' fill='#000000' legendType='none'/>
            <Brush dataKey='name' height={20} stroke='#000000' travellerWidth={10} gap={10} startIndex={getBrushStartIndex(gene?.startPosition, transformedData)} endIndex={getBrushEndIndex(gene?.endPosition, transformedData)}/>
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
            <YAxis ticks={[0, 0.001, 0.002, 0.003]}/>
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

const CalculateEntropy = (
  muts: MutationProportionEntry[] | undefined,
  sequenceType: SequenceType
): PositionEntropy[] => {
  let positionProps = new Array<PositionProportion>;

  muts?.forEach(mut => {    
    if (mut.mutation.includes(":")){
      let decoded = decodeAAMutation(mut.mutation)
      if (decoded.mutatedBase != '-') {
        let pp: PositionProportion = {position: mut.mutation, mutation: decoded.mutatedBase, proportion: mut.proportion };
        positionProps.push(pp);
      }
    } else {
      let decoded = decodeNucMutation(mut.mutation)
      if (decoded.mutatedBase != '-') {
        let pp: PositionProportion = {position: decoded.position.toString(), mutation: decoded.mutatedBase, proportion: mut.proportion };
        positionProps.push(pp);
      }
  }});

  const positionGroups = Object.entries(groupBy(positionProps, p => p.position)).map(p => {
    return {
      position: p[0], 
      proportions: p[1],
      entropy: 0
    }
  });

  //calculate remaining original proportion for each position
  positionGroups.forEach(pos => {
    let propSum = 0;
    pos.proportions.forEach(p => (propSum += p.proportion));
    let remainder = 1 - propSum;
    if (remainder != 0) {
      let pp: PositionProportion = { position: pos.position, mutation: 'ref', proportion: remainder }; //set reference flag as mutation, so it can later be displayed correctly
      pos.proportions.push(pp);
    }
  });

  //convert proportion to entropy
  positionGroups.map(p => {
    let sum = 0;
    p.proportions.forEach(pp => (sum += pp.proportion * Math.log(pp.proportion)));
    p.entropy = -sum;
  });

  return positionGroups;
};

const MeanEntropy = (posEntropy: PositionEntropy[], sequenceType: SequenceType): number => {
  let sum = 0;
  posEntropy?.forEach(e => (sum += e.entropy));
  const positionCount = sequenceType == "nuc" ? 29903 : 10000
  return sum / positionCount;
};

const WeeklyMeanEntropy = (
  weeks: { proportions: MutationProportionEntry[]; date: DateRange }[] | undefined,
  sequenceType: SequenceType
): WeekEntropy[] => {
  let means = new Array<WeekEntropy>();
  weeks?.forEach(w =>
    means.push({ week: w.date, meanEntropy: MeanEntropy(CalculateEntropy(w.proportions, sequenceType), sequenceType) })
  );
  
  return means;
};

const getBrushStartIndex = (geneStartPosition: number | undefined, plotData: PositionEntropy[]): number => {
  return geneStartPosition != undefined ? plotData.findIndex(p => parseInt(p.position) > geneStartPosition) : 0
};

const getBrushEndIndex = (geneEndPosition: number | undefined, plotData: PositionEntropy[]): number => {
  return geneEndPosition != undefined ? plotData.findIndex(p => parseInt(p.position) > geneEndPosition) : (plotData.length-1)
};

const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);

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

        <p style={{ paddingLeft: 10, paddingRight: 10 }}>Proportions:</p>
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

function formatXAxis(value: any) {
  return value.toString().includes(":") ? decodeAAMutation(value).gene : value;
}