import { LapisSelector } from '../data/LapisSelector';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { transformToVariantQuery } from '../data/VariantSelector';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import React, { useMemo, useState, Fragment } from 'react';
import { globalDateCache, UnifiedDay, UnifiedIsoWeek } from '../helpers/date-cache';
import { NamedCard } from './NamedCard';
import { sortListByNucMutation } from '../helpers/nuc-mutation';
import { scaleLinear } from 'd3-scale';
import { sortListByAAMutation } from '../helpers/aa-mutation';
import { useResizeDetector } from 'react-resize-detector';
import { SequenceType } from '../data/SequenceType';
import NumericInput from 'react-numeric-input';
import { Form, OverlayTrigger, Popover } from 'react-bootstrap';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import { ColorScale, ColorScaleInput } from './ColorScaleInput';
import { PipeDividedOptionsButtons } from '../helpers/ui';

type Data = {
  weeks: UnifiedIsoWeek[];
  mutations: {
    mutation: string;
    proportions: number[];
    counts: number[];
  }[];
  ticks: { min: UnifiedDay; middle: UnifiedDay; max: UnifiedDay };
};

type DeletionFilter = 'all' | 'non-deletion' | 'deletion-only';

type Props = {
  selector: LapisSelector;
};

export const VariantMutationsTimelines = ({ selector }: Props) => {
  const [sequenceType, setSequenceType] = useState<SequenceType>('aa');
  const [minProportion, setMinProportion] = useState(0.05);
  const [maxProportion, setMaxProportion] = useState(0.9);
  const [gene, setGene] = useState<string>('all');
  const [deletionFilter, setDeletionFilter] = useState<DeletionFilter>('non-deletion');
  const [logitScale, setLogitScale] = useState(false);
  const [colorScale, setColorScale] = useState<ColorScale>({
    minValue: 0,
    maxValue: 1,
    minColor: '#bae0e3',
    maxColor: '#040e8c',
  });

  const data = useData(selector, sequenceType, minProportion, maxProportion, gene, deletionFilter);

  const controls = (
    <div className='mb-4'>
      {/* AA vs. nucs */}
      <div className='mb-2 flex'>
        <PipeDividedOptionsButtons
          options={[
            { label: 'Amino acids', value: 'aa' },
            { label: 'Nucleotides', value: 'nuc' },
          ]}
          selected={sequenceType}
          onSelect={setSequenceType}
        />
      </div>
      {/* Genes */}
      {sequenceType === 'aa' && (
        <div className='w-72 flex mb-2'>
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
      )}
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
      {/* Deletions */}
      <div className='mb-2'>
        <PipeDividedOptionsButtons
          options={[
            { label: 'All', value: 'all' },
            { label: 'Exclude deletions', value: 'non-deletion' },
            { label: 'Deletions only', value: 'deletion-only' },
          ]}
          selected={deletionFilter}
          onSelect={setDeletionFilter}
        />
      </div>
      {/* Color scale */}
      <div className='mb-2 flex'>
        <div className='mr-2'>Color scale:</div>
        <PipeDividedOptionsButtons
          options={[
            { label: 'Linear', value: false },
            { label: 'Logit', value: true },
          ]}
          selected={logitScale}
          onSelect={setLogitScale}
        />
      </div>
      <ColorScaleInput value={colorScale} onChange={setColorScale} />
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
    plotArea = <Plot data={data} logitScale={logitScale} colorScale={colorScale} />;
  }

  return (
    <NamedCard title='Mutations over time'>
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
  gene: string,
  deletionFilter: DeletionFilter
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
      let filteredMutations = variantMutations.payload.filter(
        m => m.proportion >= minProportion && m.proportion <= maxProportion
      );
      if (deletionFilter === 'non-deletion') {
        filteredMutations = filteredMutations.filter(m => !m.mutation.endsWith('-'));
      } else if (deletionFilter === 'deletion-only') {
        filteredMutations = filteredMutations.filter(m => m.mutation.endsWith('-'));
      }
      if (sequenceType === 'aa' && gene !== 'all') {
        filteredMutations = filteredMutations.filter(m => m.mutation.startsWith(gene + ':'));
      }
      if (filteredMutations.length > 70) {
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
    [
      variantMutations,
      basicVariantDataQuery.data?.sequenceType,
      minProportion,
      maxProportion,
      gene,
      deletionFilter,
    ]
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
  logitScale: boolean;
  colorScale: ColorScale;
};

const Plot = ({ data, logitScale, colorScale }: PlotProps) => {
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
        {data.mutations.map(({ mutation, proportions, counts }, i) => (
          <Fragment key={'frag-' + mutation}>
            <div
              className='text-right pr-4'
              key={mutation}
              style={{ gridRowStart: i + 1, gridColumnStart: 1 }}
            >
              {mutation}
            </div>
            {proportions.map((p, j) => (
              <div
                style={{ gridRowStart: i + 1, gridColumnStart: j + 2 }}
                className='py-1'
                key={mutation + j}
              >
                <ProportionBox
                  mutation={mutation}
                  week={data.weeks[j]}
                  proportion={p}
                  count={counts[j]}
                  showText={showText}
                  logitScale={logitScale}
                  colorScale={colorScale}
                  key={'pb' + mutation + j}
                />
              </div>
            ))}
          </Fragment>
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
  week: UnifiedIsoWeek;
  mutation: string;
  proportion: number;
  count: number;
  showText: ShowText;
  logitScale: boolean;
  colorScale: ColorScale;
};

const logit = (p: number) => {
  if (p === 1) {
    return 1; // Instead of +Inf
  }
  if (p === 0) {
    return 0; // Instead of -Inf
  }
  return Math.log(p / (1 - p)) / 8 + 0.5; // Arbitrary defined by me... looks alright
};

const ProportionBox = ({
  week,
  mutation,
  proportion,
  count,
  showText,
  logitScale,
  colorScale,
}: ProportionBoxProps) => {
  const { maxValue, minValue, maxColor, minColor } = colorScale;
  const d3ColorScale = scaleLinear<string, string>().domain([minValue, maxValue]).range([minColor, maxColor]);
  let backgroundColor = '';
  if (isNaN(proportion)) {
    backgroundColor = 'lightgrey';
  } else if (proportion === 0) {
    backgroundColor = 'white';
  } else {
    const valueForColor = Math.max(Math.min(logitScale ? logit(proportion) : proportion, maxValue), minValue);
    backgroundColor = d3ColorScale(valueForColor);
  }
  const color = proportion < (maxValue - minValue) / 2 + minValue ? 'black' : 'white';

  let value;
  if (isNaN(proportion) || showText === 'hidden') {
    value = undefined;
  } else if (showText === 'normal') {
    value = (proportion * 100).toFixed(1) + '%';
  } else if (showText === 'short') {
    value = (proportion * 100).toFixed(0) + '%';
  }

  const popover = (
    <Popover id='popover-basic' style={{ maxWidth: '600px' }}>
      <Popover.Body>
        <div className='font-bold'>
          Week {week.isoWeek}, {week.isoYear} ({week.firstDay.string})
        </div>
        <div>{mutation}</div>
        <div>
          {count} samples ({(proportion * 100).toFixed(2)}%)
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger={['hover', 'focus', 'click']}
      overlay={popover}
      rootClose={true}
      transition={false}
      placement='top'
    >
      <div style={{ backgroundColor, color }} className='text-xs	text-center w-full h-full hover:font-bold'>
        {value}
      </div>
    </OverlayTrigger>
  );
};
