import { LapisSelector } from '../data/LapisSelector';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { transformToVariantQuery } from '../data/VariantSelector';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { useMemo } from 'react';
import { globalDateCache, UnifiedDay, UnifiedIsoWeek } from '../helpers/date-cache';
import { NamedCard } from './NamedCard';
import { sortListByNucMutation } from '../helpers/nuc-mutation';
import { scaleLinear } from 'd3-scale';
import { sortListByAAMutation } from '../helpers/aa-mutation';
import { useResizeDetector } from 'react-resize-detector';

type ProportionRange = {
  min: number;
  max: number;
};

type Props = {
  selector: LapisSelector;
};
const proportionRange: ProportionRange = { min: 0.05, max: 0.95 };

export const VariantMutationsTimelines = ({ selector }: Props) => {
  const { width, ref } = useResizeDetector<HTMLDivElement>();

  // Fetch the date distribution and mutations of the variant
  const basicVariantDataQuery = useQuery(
    signal =>
      Promise.all([
        DateCountSampleData.fromApi(selector, signal),
        MutationProportionData.fromApi(selector, 'aa', signal),
      ]),
    [selector]
  );
  const [variantDateCounts, variantMutations] = basicVariantDataQuery.data ?? [undefined, undefined];

  // Fetch the date distributions of the "variant+mutation"s
  const mutationsTimesQuery = useQuery(
    async signal => {
      if (!variantMutations) {
        return undefined;
      }
      const filteredMutations = variantMutations.payload
        .filter(m => m.proportion >= proportionRange.min && m.proportion <= proportionRange.max)
        .filter(m => !m.mutation.endsWith('-')); // TODO We might want to allow the user to include deletions
      const variantAsVariantQuery = transformToVariantQuery(selector.variant ?? {});
      const selectorsWithMutation: LapisSelector[] = filteredMutations.map(m => ({
        ...selector,
        variant: {
          variantQuery: `(${variantAsVariantQuery}) & ${m.mutation}`,
        },
      }));
      return Promise.all(
        selectorsWithMutation.map((s, i) =>
          DateCountSampleData.fromApi(s, signal).then(data => ({
            mutation: filteredMutations[i].mutation,
            data,
          }))
        )
      );
    },
    [variantMutations]
  );

  // Transform the data: calculate weekly proportions
  const data:
    | undefined
    | 'empty'
    | {
        weeks: UnifiedIsoWeek[];
        mutations: {
          mutation: string;
          proportions: number[];
          counts: number[];
        }[];
        ticks: { min: UnifiedDay; middle: UnifiedDay; max: UnifiedDay };
      } = useMemo(() => {
    if (!variantDateCounts || !mutationsTimesQuery.data) {
      return undefined;
    }
    if (variantDateCounts.payload.length === 0) {
      return 'empty';
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
    const mutations = mutationsTimesQuery.data.map(mutationDateCounts => {
      const proportionsByWeek = DateCountSampleData.proportionByWeek(
        mutationDateCounts.data.payload,
        variantDateCounts.payload
      );
      const proportions: number[] = new Array(weeks.length).fill(0);
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
    const sorted2 = sortListByNucMutation(mutations, m => m.mutation);
    const sorted = sortListByAAMutation(mutations, m => m.mutation);

    return { weeks, mutations: sorted, ticks };
  }, [variantDateCounts, mutationsTimesQuery]);

  if (!data) {
    return <Loader />;
  }

  if (data === 'empty') {
    return <NamedCard title='Substitutions over time'>Not enough data available</NamedCard>;
  }

  // We only display the proportion numbers if each cell has at least 50px.
  const showText = width ? (width - 150) / data.weeks.length > 50 : false;

  return (
    <NamedCard title='Substitutions over time'>
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
    </NamedCard>
  );
};

type ProportionBoxProps = {
  proportion: number;
  showText: boolean;
};

const colorScale = scaleLinear<string, string>().domain([0, 1]).range(['#b9c8e2', '#045a8d']);

const ProportionBox = ({ proportion, showText }: ProportionBoxProps) => {
  let backgroundColor = '';
  if (isNaN(proportion)) {
    backgroundColor = 'grey';
  } else if (proportion === 0) {
    backgroundColor = 'white';
  } else {
    backgroundColor = colorScale(proportion);
  }
  const color = proportion < 0.5 ? 'black' : 'white';

  return (
    <div style={{ backgroundColor, color }} className='text-xs	text-center w-full h-full'>
      {showText && <>{(proportion * 100).toFixed(1)}%</>}
    </div>
  );
};
