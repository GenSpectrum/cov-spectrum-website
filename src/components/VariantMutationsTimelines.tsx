import { LapisSelector } from '../data/LapisSelector';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { transformToVariantQuery } from '../data/VariantSelector';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import React, { useMemo, useState } from 'react';
import { globalDateCache, UnifiedDay, UnifiedIsoWeek } from '../helpers/date-cache';
import { NamedCard } from './NamedCard';
import { sortListByNucMutation } from '../helpers/nuc-mutation';
import { scaleLinear } from 'd3-scale';
import { sortListByAAMutation } from '../helpers/aa-mutation';
import { useResizeDetector } from 'react-resize-detector';
import { SequenceType } from '../data/SequenceType';
import NumericInput from 'react-numeric-input';
import { Form } from 'react-bootstrap';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';

type Data = {
  weeks: UnifiedIsoWeek[];
  mutations: {
    mutation: string;
    proportions: number[];
    counts: number[];
  }[];
  ticks: { min: UnifiedDay; middle: UnifiedDay; max: UnifiedDay };
};

type Props = {
  selector: LapisSelector;
};

export const VariantMutationsTimelines = ({ selector }: Props) => {
  const [sequenceType, setSequenceType] = useState<SequenceType>('aa');
  const [minProportion, setMinProportion] = useState(0.05);
  const [maxProportion, setMaxProportion] = useState(0.9);
  const [gene, setGene] = useState<string>('all');

  const data = useData(selector, sequenceType, minProportion, maxProportion, gene);

  const controls = (
    <div className='mb-4'>
      {/* TODO Reduce code redundancy: VariantMutations (and maybe other components) has very similar code */}
      {/* AA vs. nucs */}
      <div className='mb-2'>
        Sequence type:{' '}
        <span
          className={sequenceType === 'aa' ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setSequenceType('aa')}
        >
          Amino acids
        </span>
        {' | '}
        <span
          className={sequenceType === 'nuc' ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setSequenceType('nuc')}
        >
          Nucleotides
        </span>
      </div>
      {/* Proportions */}
      <div className='mb-2'>
        Proportions:{' '}
        <NumericInput
          precision={1}
          step={0.1}
          min={0.1}
          max={99}
          style={{ input: { width: '85px', textAlign: 'right' } }}
          format={value => `${value}%`}
          value={(minProportion * 100).toFixed(1)}
          onChange={value => setMinProportion(value! / 100)}
        />
        {' - '}
        <NumericInput
          precision={1}
          step={0.1}
          min={0.2}
          max={100}
          style={{ input: { width: '85px', textAlign: 'right' } }}
          format={value => `${value}%`}
          value={(maxProportion * 100).toFixed(1)}
          onChange={value => setMaxProportion(value! / 100)}
        />
      </div>
      {/* Genes */}
      {sequenceType === 'aa' && (
        <div className='w-72 flex'>
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
              <option value={g}>{g}</option>
            ))}
          </Form.Control>
        </div>
      )}
    </div>
  );

  let plotArea;
  if (!data) {
    plotArea = <Loader />;
  } else if (data === 'empty') {
    plotArea = <>Not enough data available</>;
  } else if (data === 'too-big') {
    plotArea = <>There are too many mutation. Please adapt the filters to reduce the number of mutations.</>;
  } else if (data.mutations.length === 0) {
    plotArea = <>No mutation found</>;
  } else {
    plotArea = <Plot data={data} />;
  }

  return (
    <NamedCard title='Substitutions over time'>
      {controls}
      {plotArea}
    </NamedCard>
  );
};

const useData = (
  selector: LapisSelector,
  sequenceType: SequenceType,
  minProportion: number,
  maxProportion: number,
  gene: string
): undefined | 'empty' | 'too-big' | Data => {
  // Fetch the date distribution and mutations of the variant
  const basicVariantDataQuery = useQuery(
    async signal => ({
      sequenceType,
      result: await Promise.all([
        DateCountSampleData.fromApi(selector, signal),
        MutationProportionData.fromApi(selector, sequenceType, signal),
      ]),
    }),
    [selector, sequenceType]
  );
  const [variantDateCounts, variantMutations] = basicVariantDataQuery.data?.result ?? [undefined, undefined];

  // Fetch the date distributions of the "variant+mutation"s
  const mutationsTimesQuery = useQuery(
    async signal => {
      const sequenceType = basicVariantDataQuery.data?.sequenceType;
      if (!variantMutations || !sequenceType) {
        return undefined;
      }
      let filteredMutations = variantMutations.payload
        .filter(m => m.proportion >= minProportion && m.proportion <= maxProportion)
        .filter(m => !m.mutation.endsWith('-')); // TODO We might want to allow the user to include deletions
      if (sequenceType === 'aa' && gene !== 'all') {
        filteredMutations = filteredMutations.filter(m => m.mutation.startsWith(gene + ':'));
      }
      if (filteredMutations.length > 50) {
        return 'too-big';
      }
      const variantAsVariantQuery = transformToVariantQuery(selector.variant ?? {});
      const selectorsWithMutation: LapisSelector[] = filteredMutations.map(m => ({
        ...selector,
        variant: {
          variantQuery: `(${variantAsVariantQuery}) & ${m.mutation}`,
        },
      }));
      return {
        sequenceType,
        result: await Promise.all(
          selectorsWithMutation.map((s, i) =>
            DateCountSampleData.fromApi(s, signal).then(data => ({
              mutation: filteredMutations[i].mutation,
              data,
            }))
          )
        ),
      };
    },
    [variantMutations, basicVariantDataQuery.data?.sequenceType, minProportion, maxProportion, gene]
  );

  // Transform the data: calculate weekly proportions
  const data = useMemo(() => {
    if (!variantDateCounts || !mutationsTimesQuery.data) {
      return undefined;
    }
    if (mutationsTimesQuery.data === 'too-big') {
      return 'too-big';
    }
    if (variantDateCounts.payload.length === 0) {
      return 'empty';
    }
    const sequenceType = mutationsTimesQuery.data?.sequenceType;
    if (!sequenceType) {
      return undefined;
    }

    // Calculate weeks
    const dayRange = globalDateCache.rangeFromDays(
      variantDateCounts.payload.filter(v => v.date).map(v => v.date!)
    )!;
    const weeks = globalDateCache.weeksFromRange({ min: dayRange.min.isoWeek, max: dayRange.max.isoWeek });
    const weekToIndexMap: Map<UnifiedIsoWeek, number> = new Map();
    weeks.forEach((w, i) => weekToIndexMap.set(w, i));
    const weekRange = globalDateCache.rangeFromWeeks(weeks)!;
    const middleDay = globalDateCache.middleDay({ min: weekRange.min.firstDay, max: weekRange.max.firstDay });
    const ticks = { min: weekRange.min.firstDay, middle: middleDay, max: weekRange.max.firstDay };

    // Calculate proportions
    const mutations = mutationsTimesQuery.data.result.map(mutationDateCounts => {
      const proportionsByWeek = DateCountSampleData.proportionByWeek(
        mutationDateCounts.data.payload,
        variantDateCounts.payload
      );
      const proportions: number[] = new Array(weeks.length).fill(NaN);
      const counts: number[] = new Array(weeks.length).fill(0);
      proportionsByWeek.forEach(({ count, proportion }, week) => {
        const index = weekToIndexMap.get(week)!;
        proportions[index] = proportion ?? NaN;
        counts[index] = count;
      });
      return {
        mutation: mutationDateCounts.mutation,
        proportions,
        counts,
      };
    });
    const sortFunc = sequenceType === 'aa' ? sortListByAAMutation : sortListByNucMutation;
    const sorted = sortFunc(mutations, m => m.mutation);

    return { weeks, mutations: sorted, ticks };
  }, [variantDateCounts, mutationsTimesQuery]);

  return data;
};

type PlotProps = {
  data: Data;
};

const Plot = ({ data }: PlotProps) => {
  const { width, ref } = useResizeDetector<HTMLDivElement>();

  // We only display the proportion numbers if each cell has at least 50px.
  let showText: ShowText;
  if (!width) {
    showText = 'hidden';
  } else if ((width - 150) / data.weeks.length > 40) {
    showText = 'normal';
  } else if ((width - 150) / data.weeks.length > 28) {
    showText = 'short';
  } else {
    showText = 'hidden';
  }

  return (
    <>
      <div
        ref={ref}
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${data.mutations.length}, 24px)`,
          gridTemplateColumns: `8rem repeat(${data.weeks.length}, 1fr)`,
        }}
      >
        {data.mutations.map(({ mutation, proportions }, i) => (
          <>
            <div className='text-right pr-4' style={{ gridRowStart: i + 1, gridColumnStart: 1 }}>
              {mutation}
            </div>
            {proportions.map((p, j) => (
              <div style={{ gridRowStart: i + 1, gridColumnStart: j + 2 }} className='py-1'>
                <ProportionBox proportion={p} showText={showText} />
              </div>
            ))}
          </>
        ))}
      </div>
      <div className='flex justify-between'>
        <div className='ml-24'>{data.ticks.min.string}</div>
        <div>{data.ticks.middle.string}</div>
        <div>{data.ticks.max.string}</div>
      </div>
    </>
  );
};

type ShowText = 'normal' | 'short' | 'hidden';

type ProportionBoxProps = {
  proportion: number;
  showText: ShowText;
};

const colorScale = scaleLinear<string, string>().domain([0, 1]).range(['#b9c8e2', '#045a8d']);

const ProportionBox = ({ proportion, showText }: ProportionBoxProps) => {
  let backgroundColor = '';
  if (isNaN(proportion)) {
    backgroundColor = 'lightgrey';
  } else if (proportion === 0) {
    backgroundColor = 'white';
  } else {
    backgroundColor = colorScale(proportion);
  }
  const color = proportion < 0.5 ? 'black' : 'white';

  let value;
  if (isNaN(proportion) || showText === 'hidden') {
    value = undefined;
  } else if (showText === 'normal') {
    value = (proportion * 100).toFixed(1) + '%';
  } else if (showText === 'short') {
    value = (proportion * 100).toFixed(0) + '%';
  }

  return (
    <div style={{ backgroundColor, color }} className='text-xs	text-center w-full h-full'>
      {value}
    </div>
  );
};
