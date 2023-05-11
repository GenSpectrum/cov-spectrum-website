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
import { TransformedTime } from './NucleotideEntropy';

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
  //fetch the proportions per position over the whole date range
  const mutationProportionEntriesQuery = useQuery(
    async signal => {
      return {
        sequenceType: sequenceType,
        result: await Promise.all([MutationProportionData.fromApi(selector, sequenceType, signal)]).then(
          async ([data]) => {
            return {
              proportions: data.payload,
            };
          }
        ),
      };
    },
    [selector, sequenceType]
  );

  //fetch the proportions per position in weekly segments
  const weeklyMutationProportionQuery = useQuery(
    async signal => {
      //calculate weeks
      const dayArray: UnifiedDay[] = [
        selector.dateRange?.getDateRange().dateFrom!,
        selector.dateRange?.getDateRange().dateTo!,
      ];
      const dayRange = globalDateCache.rangeFromDays(dayArray)!;
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
    [selector, sequenceType]
  );

  return useMemo(() => {
    if (!mutationProportionEntriesQuery.data || !weeklyMutationProportionQuery.data) {
      return undefined;
    }
    const sequenceType = mutationProportionEntriesQuery.data?.sequenceType;
    if (!sequenceType) {
      return undefined;
    }
    if (!selectedGenes) {
      return undefined;
    }
    //calculate ticks for entropy-over-time plot
    const dates = weeklyMutationProportionQuery.data.map(p => {
      return { date: p.date.dateFrom?.dayjs.toDate()! };
    });
    const ticks = getTicks(dates);

    //transform data for entropy-per-position plot
    const positionEntropy = calculateEntropy(
      mutationProportionEntriesQuery.data.result.proportions,
      sequenceType,
      includeDeletions,
      includePositionsWithZeroEntropy
    );
    const sortedEntropy =
      sequenceType === 'aa' ? sortListByAAMutation(positionEntropy, m => m.position) : positionEntropy;

    //transform data for entropy-over-time plot
    const weeklyMeanEntropies: TransformedTime[] = [];
    selectedGenes.forEach(selectedGene => {
      const timeData = weeklyMeanEntropy(
        weeklyMutationProportionQuery.data!,
        sequenceType,
        selectedGene,
        includeDeletions
      )
        .slice(0, -1)
        .map(({ week, meanEntropy }) => {
          return { day: week.dateFrom?.dayjs.toDate().getTime(), [selectedGene.value]: meanEntropy };
        });
      weeklyMeanEntropies.push(timeData);
    });
    const timeArr: any = [];
    const timeMap = new Map();
    weeklyMeanEntropies.forEach(weeklyEntropy => {
      weeklyEntropy.forEach(obj => {
        if (timeMap.has(obj.day)) {
          timeMap.set(obj.day, { ...timeMap.get(obj.day), ...obj });
        } else {
          timeMap.set(obj.day, { ...obj });
        }
      });
    });
    timeMap.forEach(obj => timeArr.push(obj));

    return { positionEntropy: sortedEntropy, timeData: timeArr, sequenceType: sequenceType, ticks };
  }, [
    mutationProportionEntriesQuery,
    weeklyMutationProportionQuery,
    selectedGenes,
    includeDeletions,
    includePositionsWithZeroEntropy,
  ]);
};
