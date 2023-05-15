import { LapisSelector } from '../../data/LapisSelector';
import { SequenceType } from '../../data/SequenceType';
import { calculateEntropy, GeneOption, PositionEntropy, weeklyMeanEntropy } from './calculateEntropy';
import { useQuery } from '../../helpers/query-hook';
import { MutationProportionData } from '../../data/MutationProportionDataset';
import { MutationProportionEntry } from '../../data/MutationProportionEntry';
import { globalDateCache, UnifiedDay } from '../../helpers/date-cache';
import { DateRange } from '../../data/DateRange';
import { FixedDateRangeSelector } from '../../data/DateRangeSelector';
import { useMemo } from 'react';
import { getTicks } from '../../helpers/ticks';
import { sortListByAAMutation } from '../../helpers/aa-mutation';

export type NucleotideEntropyData = {
  positionEntropy: PositionEntropy[];
  timeData: any;
  sequenceType: SequenceType;
  ticks: number[];
};

export const useNucleotideEntropyData = (
  selector: LapisSelector,
  sequenceType: SequenceType,
  selectedGenes: GeneOption[],
  includeDeletions: boolean,
  includePositionsWithZeroEntropy: boolean
): NucleotideEntropyData | undefined => {
  const mutationProportionsForWholeDateRange = useQuery(
    async signal =>
      await MutationProportionData.fromApi(selector, sequenceType, signal).then(data => ({
        proportions: data.payload,
      })),
    [selector, sequenceType]
  );

  const weeklyMutationProportionQuery = useQuery(
    async signal => fetchWeeklyMutationProportions(selector, sequenceType, signal),
    [selector, sequenceType]
  );

  return useMemo(() => {
    if (!mutationProportionsForWholeDateRange.data || !weeklyMutationProportionQuery.data) {
      return undefined;
    }

    const ticks = calculateDateTicks(weeklyMutationProportionQuery.data);

    const sortedEntropy = calculateEntropyByPosition(
      mutationProportionsForWholeDateRange.data.proportions,
      sequenceType,
      includeDeletions,
      includePositionsWithZeroEntropy
    );

    const timeArr = calculateEntropyByTime(
      selectedGenes,
      weeklyMutationProportionQuery.data!,
      sequenceType,
      includeDeletions
    );

    return { positionEntropy: sortedEntropy, timeData: timeArr, sequenceType: sequenceType, ticks };
  }, [
    mutationProportionsForWholeDateRange,
    weeklyMutationProportionQuery,
    selectedGenes,
    includeDeletions,
    includePositionsWithZeroEntropy,
    sequenceType,
  ]);
};

function fetchWeeklyMutationProportions(
  selector: LapisSelector,
  sequenceType: 'aa' | 'nuc',
  signal: AbortSignal
) {
  const dayArray: UnifiedDay[] = [
    selector.dateRange?.getDateRange().dateFrom!,
    selector.dateRange?.getDateRange().dateTo!,
  ];
  const dayRange = globalDateCache.rangeFromDays(dayArray)!;
  const weeks = globalDateCache.weeksFromRange({ min: dayRange.min.isoWeek, max: dayRange.max.isoWeek });

  let weekDateRanges = weeks.map(week => ({
    dateFrom: week.firstDay,
    dateTo: week.firstDay,
  }));

  const weekSelectors = weekDateRanges.map(weekDateRange => ({
    ...selector,
    dateRange: new FixedDateRangeSelector(weekDateRange),
  }));

  return Promise.all(
    weekSelectors.map((weekSelector, i) =>
      MutationProportionData.fromApi(weekSelector, sequenceType, signal).then(data => ({
        proportions: data.payload,
        date: weekDateRanges[i],
      }))
    )
  );
}

function calculateDateTicks(
  weeklyMutationProportions: { date: DateRange; proportions: MutationProportionEntry[] }[]
) {
  const dates = weeklyMutationProportions.map(weeklyMutationProportion => ({
    date: weeklyMutationProportion.date.dateFrom?.dayjs.toDate()!,
  }));
  return getTicks(dates);
}

function calculateEntropyByPosition(
  mutations: MutationProportionEntry[] | undefined,
  sequenceType: 'aa' | 'nuc',
  includeDeletions: boolean,
  includePositionsWithZeroEntropy: boolean
) {
  const positionEntropy = calculateEntropy(
    mutations,
    sequenceType,
    includeDeletions,
    includePositionsWithZeroEntropy
  );
  return sequenceType === 'aa' ? sortListByAAMutation(positionEntropy, m => m.position) : positionEntropy;
}

function calculateEntropyByTime(
  selectedGenes: GeneOption[],
  weeks: Awaited<{
    date: DateRange;
    proportions: MutationProportionEntry[];
  }>[],
  sequenceType: 'aa' | 'nuc',
  includeDeletions: boolean
) {
  const timeMap = selectedGenes
    .map(selectedGene =>
      weeklyMeanEntropy(weeks, sequenceType, selectedGene, includeDeletions)
        .slice(0, -1)
        .map(({ week, meanEntropy }) => ({
          day: week.dateFrom?.dayjs.toDate().getTime()!,
          [selectedGene.value]: meanEntropy,
        }))
    )
    .flat()
    .reduce((aggregated, weeklyMeanEntropy) => {
      const previousValue = aggregated[weeklyMeanEntropy.day] ?? {};
      aggregated[weeklyMeanEntropy.day] = { ...previousValue, ...weeklyMeanEntropy };
      return aggregated;
    }, {} as Record<number, any>);

  return Object.values(timeMap);
}
