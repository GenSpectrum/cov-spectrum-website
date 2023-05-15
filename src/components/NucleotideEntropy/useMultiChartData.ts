import { LapisSelector } from '../../data/LapisSelector';
import { GeneOption, weeklyMeanEntropy } from './calculateEntropy';
import { SequenceType } from '../../data/SequenceType';
import { globalDateCache } from '../../helpers/date-cache';
import { DateRange } from '../../data/DateRange';
import { FixedDateRangeSelector } from '../../data/DateRangeSelector';
import { useQuery } from '../../helpers/query-hook';
import { MutationProportionData } from '../../data/MutationProportionDataset';
import { useMemo } from 'react';
import {
  addSequenceTypeToRecognizeWhenUseQueryDidNotUpdateTheReturnedDataYet,
  calculateDateTicks,
} from './hooks';

export const useMultiChartData = (
  selectors: LapisSelector[],
  selectedGene: GeneOption[],
  variants: string[],
  sequenceType: SequenceType,
  includeDeletions: boolean
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
      ).then(addSequenceTypeToRecognizeWhenUseQueryDidNotUpdateTheReturnedDataYet(sequenceType)),
    [weekSelectors, sequenceType]
  );

  return useMemo(() => {
    if (!weeklyVariantMutationProportionQuery.data) {
      return undefined;
    }
    if (sequenceType !== weeklyVariantMutationProportionQuery.data.sequenceType) {
      return undefined;
    }
    if (!variants[0]) {
      return undefined;
    }
    if (variants.length * weekRangesCount !== weeklyVariantMutationProportionQuery.data.value.length) {
      return undefined; // same as for the sequenceType: The query result might hold outdated data when adding a variant
    }

    const ticks = calculateDateTicks(weeklyVariantMutationProportionQuery.data.value);

    const weeklyDataByTimestamp = weeklyMeanEntropy(
      weeklyVariantMutationProportionQuery.data.value,
      sequenceType,
      selectedGene[0],
      includeDeletions
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
    includeDeletions,
    sequenceType,
    weekRangesCount,
  ]);
};
