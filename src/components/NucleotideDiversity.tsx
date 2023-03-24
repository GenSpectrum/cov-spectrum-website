import React, { useState, useMemo } from 'react';
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
//import { PercentageInput } from './PercentageInput';
import { NamedCard } from './NamedCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
import { colors } from '../widgets/common';

type Props = {
  selector: LapisSelector;
};

type PositionProportion = {
  position: string;
  mutation: string | undefined;
  original: string | undefined;
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

type plotWeekEntropy = {
  day: string | undefined;
  entropy: number;
}

type Data = {
  positionEntropy: PositionEntropy[];
  timeData: plotWeekEntropy[];
  sequenceType: SequenceType;
};

type Gene = {
  name: string;
  startPosition: number;
  endPosition: number;
  aaSeq: string;
};

type plotGeneBar = {
  type: string;
  name: string;
  position: number[];
};

const toolTipStyle = {
  backgroundColor: 'white',
  zIndex: 1,
};

export const NucleotideDiversity = ({ selector }: Props) => {
  const [plotType, setPlotType] = useState<string>('pos');
  const [sequenceType, setSequenceType] = useState<SequenceType>('nuc');
  const [threshold, setThreshold] = useState(0.0);
  const [gene, setGene] = useState<string>('all');

  const data = useData(selector, sequenceType);

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
        </div>
      )}
      {/* {/*Minimum entropy treshold to display}
      {plotType === 'pos' && (
      <div className='flex mb-2'>
        <div className='mr-2'>Entropy display threshold: </div>
        <PercentageInput ratio={threshold} setRatio={setThreshold} className='mr-2' />
      </div>)} */}
    </div>
  );

  let geneRange: Gene | undefined = jsonRefData.genes.find(g => g.name === gene);

  let plotArea;
  if (!data) {
    plotArea = <Loader />;
  } else {
    plotArea = (
      <Plot
        threshold={threshold}
        plotData={data}
        plotType={plotType}
        gene={geneRange}
        genes={jsonRefData.genes}
        startIndex={getBrushIndex(geneRange, data.positionEntropy, data.sequenceType).startIndex}
        stopIndex={getBrushIndex(geneRange, data.positionEntropy, data.sequenceType).stopIndex}
      />
    );
  }

  return (
    <>
      <NamedCard title='Nucleotide Diversity'>
        {controls}
        {plotArea}
      </NamedCard>
    </>
  );
};

const useData = (
  selector: LapisSelector, 
  sequenceType: SequenceType
  ): Data | undefined => {
  //fetch the proportions per position over the whole date range
  const mutationProportionEntriesQuery = useQuery(
    async signal => {
      return {
        sequenceType: sequenceType,
        result: await Promise.all([MutationProportionData.fromApi(selector, sequenceType, signal)]).then(
          async ([data]) => {
            const proportions: MutationProportionEntry[] = data.payload.map(m => m);
            return {
              proportions,
            };
          }
        ),
      };
    },
    [selector, sequenceType]
  );

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

  const data = useMemo(() => {
    if (!mutationProportionEntriesQuery.data || !weeklyMutationProportionQuery.data) {
      return undefined;
    }
    const sequenceType = mutationProportionEntriesQuery.data?.sequenceType;
    if (!sequenceType) {
      return undefined;
    }

    const positionEntropy = CalculateEntropy(mutationProportionEntriesQuery.data.result.proportions, sequenceType);
    const sortedEntropy = sequenceType === "aa"
      ? sortListByAAMutation(positionEntropy, m => m.position)
      : positionEntropy;
  
    const timeData = WeeklyMeanEntropy(weeklyMutationProportionQuery.data, sequenceType);
    const transformedTime = timeData
        .slice(0, timeData.length - 1).map(({ week, meanEntropy }) => {
          return { day: week.dateFrom?.string, entropy: meanEntropy };
        });
  
    return { positionEntropy: sortedEntropy, timeData: transformedTime, sequenceType: sequenceType};
  },
  [mutationProportionEntriesQuery, weeklyMutationProportionQuery]);

  return data;
};

type PlotProps = {
  threshold: number;
  plotData: Data;
  plotType: string;
  gene: Gene | undefined;
  genes: Gene[];
  startIndex: number;
  stopIndex: number;
};

const Plot = ({ threshold, plotData, plotType, gene, genes, startIndex, stopIndex}: PlotProps) => {
  if (plotType === 'pos') {
    //let transformedData = plotData.positionEntropy.filter(p => p.entropy >= threshold)
    return (
      <>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            key={(startIndex || 0) + (stopIndex || 0)} //This fixes a weird bug where the plot doesn't redraw when the brush indexes are changed
            width={500}
            height={500}
            data={plotData.positionEntropy}
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
            <Tooltip
              content={<CustomTooltip />}
              allowEscapeViewBox={{ y: true }}
              wrapperStyle={toolTipStyle}
            />
            <Legend />
            <Bar dataKey='entropy' fill={colors.active} legendType='none' />
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
      </>
    );
  } else {
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
            <YAxis ticks={[0, 0.001, 0.002, 0.003]} />
            <Tooltip
              formatter={(value: string) => [Number(value).toFixed(6), 'Mean entropy']}
              labelFormatter={label => {
                return 'Week starting on: ' + label;
              }}
            />
            <Legend />
            <Line type='monotone' dataKey='entropy' legendType='none' isAnimationActive={false} dot={false} stroke={colors.active} strokeWidth={3}/>
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
  let positionProps = new Array<PositionProportion>();

  muts?.forEach(mut => {
    if (sequenceType === 'aa') {
      let decoded = decodeAAMutation(mut.mutation);
      if (decoded.mutatedBase !== '-') {
        let pp: PositionProportion = {
          position: decoded.gene + ':' + decoded.originalBase + decoded.position,
          mutation: decoded.mutatedBase,
          original: decoded.originalBase,
          proportion: mut.proportion,
        };
        positionProps.push(pp);
      }
    } else {
      let decoded = decodeNucMutation(mut.mutation);
      if (decoded.mutatedBase !== '-') {
        let pp: PositionProportion = {
          position: decoded.position.toString(),
          mutation: decoded.mutatedBase,
          original: decoded.originalBase,
          proportion: mut.proportion,
        };
        positionProps.push(pp);
      }
    }
  });

  const positionGroups = Object.entries(groupBy(positionProps, p => p.position)).map(p => {
    return {
      position: p[0],
      original: p[1][0].original,
      proportions: p[1],
      entropy: 0,
    };
  });

  //calculate remaining original proportion for each position
  positionGroups.forEach(pos => {
    const remainder = 1 - pos.proportions.map(p => p.proportion).reduce((x, a) => x + a, 0);
    if (remainder !== 0) {
      pos.proportions.push({ position: pos.position, mutation: pos.original + " (ref)", original: pos.original, proportion: remainder });
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
  const sum = posEntropy.map(g => g.entropy).reduce((x, a) => x + a, 0);
  const count =
    sequenceType === 'nuc'
      ? jsonRefData.nucSeq.length
      : jsonRefData.genes.map(g => g.aaSeq.length).reduce((x, a) => x + a, 0);
  return sum / count;
};

const WeeklyMeanEntropy = (
  weeks: { proportions: MutationProportionEntry[]; date: DateRange }[] | undefined,
  sequenceType: SequenceType
): WeekEntropy[] => {
  let means = new Array<WeekEntropy>();
  weeks?.forEach(w =>
    means.push({
      week: w.date,
      meanEntropy: MeanEntropy(CalculateEntropy(w.proportions, sequenceType), sequenceType),
    })
  );

  return means;
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

const getBrushIndex = (
  gene: Gene | undefined,
  plotData: PositionEntropy[],
  sequenceType: SequenceType
): { startIndex: number; stopIndex: number } => {
  let startIndex;
  let stopIndex;
  if (sequenceType === "aa") {
    let names = plotData.map(p => decodeAAMutation(p.position).gene);
    startIndex = gene?.name !== 'All' && gene?.name !== undefined ? names.indexOf(gene.name) : 0;
    stopIndex =
      gene?.name !== 'All' && gene?.name !== undefined ? names.lastIndexOf(gene.name) : plotData.length - 1;
  } else {
    startIndex =
      gene?.startPosition !== undefined
        ? plotData.findIndex(p => parseInt(p.position) > gene.startPosition)
        : 0;
    stopIndex =
      gene?.endPosition !== undefined
        ? plotData.findIndex(p => parseInt(p.position) > gene.endPosition)
        : plotData.length - 1;
  }
  return { startIndex: startIndex, stopIndex: stopIndex };
};

const geneBars = (genes: Gene[]): plotGeneBar[] => {
  return genes.map(({ name, startPosition, endPosition, aaSeq }, i) => {
    return {
      type: 'gene',
      name: name,
      position: [startPosition, endPosition],
    };
  });
};

function formatXAxis(value: any) {
  return value.toString().includes(':') ? decodeAAMutation(value).gene : value;
}
