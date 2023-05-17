import { LapisSelector } from '../../data/LapisSelector';
import { SequenceType } from '../../data/SequenceType';
import { calculateEntropy, GeneOption, weeklyMeanEntropy } from './calculateEntropy';
import { useQuery } from '../../helpers/query-hook';
import { MutationProportionData } from '../../data/MutationProportionDataset';
import { MutationProportionEntry } from '../../data/MutationProportionEntry';
import { globalDateCache } from '../../helpers/date-cache';
import { DateRange } from '../../data/DateRange';
import { FixedDateRangeSelector } from '../../data/DateRangeSelector';
import { useMemo } from 'react';
import { getTicks } from '../../helpers/ticks';
import { sortListByAAMutation } from '../../helpers/aa-mutation';

export function addSequenceTypeToRecognizeWhenUseQueryDidNotUpdateTheReturnedDataYet(
  sequenceType: SequenceType
) {
  return <V>(value: V) => ({
    sequenceType,
    value,
  });
}

export const useNucleotideEntropyDataByPosition = (
  selector: LapisSelector,
  sequenceType: SequenceType,
  includeDeletions: boolean,
  includePositionsWithZeroEntropy: boolean
) => {
  const mutationProportionsForWholeDateRange = useQuery(
    signal =>
      MutationProportionData.fromApi(selector, sequenceType, signal)
        .then(data => ({
          proportions: data.payload,
        }))
        .then(addSequenceTypeToRecognizeWhenUseQueryDidNotUpdateTheReturnedDataYet(sequenceType)),
    [selector, sequenceType]
  );

  return useMemo(() => {
    if (!mutationProportionsForWholeDateRange.data) {
      return undefined;
    }

    if (sequenceType !== mutationProportionsForWholeDateRange.data.sequenceType) {
      return undefined;
    }

    return calculateEntropyByPosition(
      mutationProportionsForWholeDateRange.data.value.proportions,
      sequenceType,
      includeDeletions,
      includePositionsWithZeroEntropy
    );
  }, [mutationProportionsForWholeDateRange, includeDeletions, includePositionsWithZeroEntropy, sequenceType]);
};

export const useNucleotideEntropyDataByTime = (
  selector: LapisSelector,
  sequenceType: SequenceType,
  selectedGenes: GeneOption[],
  includeDeletions: boolean
) => {
  const weeklyMutationProportionQuery = useQuery(
    signal =>
      fetchWeeklyMutationProportions(selector, sequenceType, signal).then(
        addSequenceTypeToRecognizeWhenUseQueryDidNotUpdateTheReturnedDataYet(sequenceType)
      ),
    [selector, sequenceType]
  );

  return useMemo(() => {
    if (!weeklyMutationProportionQuery.data) {
      return undefined;
    }

    if (sequenceType !== weeklyMutationProportionQuery.data.sequenceType) {
      return undefined;
    }

    const ticks = calculateDateTicks(weeklyMutationProportionQuery.data.value);

    const timeArr = calculateEntropyByTime(
      selectedGenes,
      weeklyMutationProportionQuery.data.value,
      sequenceType,
      includeDeletions
    );

    return { timeData: timeArr, ticks };
  }, [weeklyMutationProportionQuery, selectedGenes, includeDeletions, sequenceType]);
};

function fetchWeeklyMutationProportions(
  selector: LapisSelector,
  sequenceType: 'aa' | 'nuc',
  signal: AbortSignal
) {
  let weekDateRanges = computeWeeklyDateRanges(selector);

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

export function computeWeeklyDateRanges(selector: LapisSelector) {
  const startAndEndDays = [
    selector.dateRange?.getDateRange().dateFrom!,
    selector.dateRange?.getDateRange().dateTo!,
  ];

  const dayRange = globalDateCache.rangeFromDays(startAndEndDays)!;
  const weeks = globalDateCache.weeksFromRange({
    min: dayRange.min.isoWeek,
    max: dayRange.max.isoWeek,
  });

  return weeks.map(week => ({
    dateFrom: week.firstDay,
    dateTo: globalDateCache.getDayUsingDayjs(week.firstDay.dayjs.endOf('week')),
  }));
}

export function calculateDateTicks(weeklyMutationProportions: { date: DateRange }[]) {
  const dates = weeklyMutationProportions.map(weeklyMutationProportion => ({
    date: weeklyMutationProportion.date.dateFrom?.dayjs.toDate()!,
  }));
  return getTicks(dates);
}

function calculateEntropyByPosition(
  mutations: MutationProportionEntry[] | undefined,
  sequenceType: SequenceType,
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
  sequenceType: SequenceType,
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
