import { LapisSelector } from '../../data/LapisSelector';
import { GeneOption, weeklyMeanEntropy } from './calculateEntropy';
import { SequenceType } from '../../data/SequenceType';
import { globalDateCache } from '../../helpers/date-cache';
import { DateRange } from '../../data/DateRange';
import { FixedDateRangeSelector } from '../../data/DateRangeSelector';
import { useQuery } from '../../helpers/query-hook';
import { MutationProportionData } from '../../data/MutationProportionDataset';
import { useMemo } from 'react';
import { getTicks } from '../../helpers/ticks';

export const useMultiChartData = (
  selectors: LapisSelector[],
  selectedGene: GeneOption[],
  variants: string[],
  sequenceType: SequenceType,
  deletions: boolean
) => {
  const days = [
    selectors[0].dateRange?.getDateRange().dateFrom!,
    selectors[0].dateRange?.getDateRange().dateTo!,
  ];
  const dayRange = globalDateCache.rangeFromDays(days)!;
  const weekDateRanges: DateRange[] = globalDateCache
    .weeksFromRange({
      min: dayRange.min.isoWeek,
      max: dayRange.max.isoWeek,
    })
    .map(week => ({
      dateFrom: week.firstDay,
      dateTo: week.firstDay,
    }));

  const weekSelectors = selectors.flatMap(selector =>
    weekDateRanges.map(weekRange => ({
      ...selector,
      dateRange: new FixedDateRangeSelector(weekRange),
    }))
  );

  let weekRangesCount = weekDateRanges.length;

  const weeklyVariantMutationProportionQuery = useQuery(
    async signal =>
      await Promise.all(
        weekSelectors.map((weekSelector, i) =>
          MutationProportionData.fromApi(weekSelector, sequenceType, signal).then(data => ({
            proportions: data.payload,
            date: weekDateRanges[i % weekRangesCount],
          }))
        )
      ),
    [selectors, sequenceType]
  );

  return useMemo(() => {
    if (!weeklyVariantMutationProportionQuery.data) {
      return undefined;
    }
    if (!selectedGene) {
      return undefined;
    }
    if (!variants[0]) {
      return undefined;
    }
    if (variants.length * weekRangesCount !== weeklyVariantMutationProportionQuery.data.length) {
      return undefined;
    }

    const dates = weeklyVariantMutationProportionQuery.data.map(proportionData => {
      return { date: proportionData.date.dateFrom?.dayjs.toDate()! };
    });
    const ticks = getTicks(dates);

    const weeklyDataByTimestamp = weeklyMeanEntropy(
      weeklyVariantMutationProportionQuery.data,
      sequenceType,
      selectedGene[0],
      deletions
    )
      .map(({ week, meanEntropy }, i) => ({
        day: week.dateFrom!.dayjs.toDate().getTime(),
        [variants[Math.floor(i / weekRangesCount)]]: meanEntropy,
      }))
      .reduce((aggregated, weeklyMeanEntropy) => {
        const previousValue = aggregated[weeklyMeanEntropy.day] ?? {};
        aggregated[weeklyMeanEntropy.day] = { ...previousValue, ...weeklyMeanEntropy };
        return aggregated;
      }, {} as Record<number, any>);

    let plotData = Object.values(weeklyDataByTimestamp); //depending on the day, the latest week just started, so the entropy is calculated as 0 because there are no samples

    return { plotData, ticks };
  }, [
    weeklyVariantMutationProportionQuery,
    selectedGene,
    variants,
    deletions,
    sequenceType,
    weekRangesCount,
  ]);
};
