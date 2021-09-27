import assert from 'assert';
import dayjs from 'dayjs';
import { globalDateCache } from '../../helpers/date-cache';
import { VariantSelector } from '../../helpers/sample-selector';
import { SampleSet, SampleSetWithSelector } from '../../helpers/sample-set';
import { getNewSamples, SamplingStrategy, toLiteralSamplingStrategy } from '../../services/api';
import { Country } from '../../services/api-types';

export interface KnownVariantWithChartData<T extends VariantSelector> {
  selector: T;
  chartData: number[]; // proportion (0-1) per week
  recentProportion: number; // the proportion of the last 14 days
}

export interface KnownVariantWithSampleSet<T extends VariantSelector> {
  selector: T;
  sampleSet: SampleSet;
}

// loadKnownVariantSampleSets loads a SampleSet for each of the known variants.
// This step is a separate from convertKnownVariantChartData so that it can be
// started before wholeSampleSetState has finished loading.
export async function loadKnownVariantSampleSets<T extends VariantSelector>(
  {
    variantSelectors,
    country,
    samplingStrategy,
    dateFrom,
    dateTo,
  }: {
    variantSelectors: T[];
    country: Country;
    samplingStrategy: SamplingStrategy;
    dateFrom?: string;
    dateTo?: string;
  },
  signal?: AbortSignal
): Promise<KnownVariantWithSampleSet<T>[]> {
  const sampleSets = await Promise.all(
    variantSelectors.map(selector =>
      getNewSamples(
        {
          country,
          matchPercentage: selector.matchPercentage,
          mutations: selector.variant.mutations,
          pangolinLineage: selector.variant.name,
          dataType: toLiteralSamplingStrategy(samplingStrategy),
          dateFrom, // past 3 months
          dateTo, // undefined
        },
        signal
      )
    )
  );
  return sampleSets.map((sampleSet, i) => ({ selector: variantSelectors[i], sampleSet }));
}

// convertKnownVariantChartData converts SampleSets into the format required
// by the known variant plots. It takes the latest 2 month window of data
// in which the proportion for some variants was known. Data for every variant
// is clipped to the same window.
// Further, it computes the proportion from the sequencing data of the last 14
// days, again ensuring that the same time window is used for every variant.
export function convertKnownVariantChartData<T extends VariantSelector>({
  variantSampleSets: variantsSampleSets,
  wholeSampleSet,
}: {
  variantSampleSets: KnownVariantWithSampleSet<T>[];
  wholeSampleSet: SampleSetWithSelector;
}): KnownVariantWithChartData<T>[] {
  // Compute the weekly chart data
  const variantWeeklyCounts = variantsSampleSets.flatMap(s => s.sampleSet.countByWeek());
  const wholeWeeklyCounts = wholeSampleSet.countByWeek();

  const dataWeekRange = globalDateCache.rangeFromWeeks(
    [...variantWeeklyCounts.values()].flatMap(map => [...map.keys()])
  );
  if (!dataWeekRange) {
    return [];
  }

  const plotWeekRange = {
    min: globalDateCache.getDayUsingDayjs(dataWeekRange.max.firstDay.dayjs.subtract(2, 'months')).isoWeek,
    max: dataWeekRange.max,
  };
  if (globalDateCache.weekIsBefore(plotWeekRange.min, dataWeekRange.min)) {
    console.warn('not enough data was fetched to show the latest 2 month window');
    plotWeekRange.min = dataWeekRange.min;
  }
  const plotWeeks = globalDateCache.weeksFromRange(plotWeekRange);

  const filledData = variantWeeklyCounts.map(counts => {
    return plotWeeks.map(w => {
      const wholeCount = wholeWeeklyCounts.get(w);
      if (!wholeCount) {
        return 0;
      }
      const variantCount = counts.get(w) ?? 0;
      return variantCount / wholeCount;
    });
  });

  assert(new Set(filledData.map(d => d.length)).size === 1);

  // Compute the proportion during the last 14 days
  const variantDailyCounts = variantsSampleSets.map(s => s.sampleSet.countByDate());
  const wholeDateCounts = wholeSampleSet.countByDate();
  const maxDate = dayjs.max([...wholeDateCounts.keys()].map(d => d.dayjs));
  let recentVariantTotal = variantDailyCounts.map(_ => 0);
  let recentWholeTotal = 0;
  for (let i = 0; i < 14; i++) {
    const d = globalDateCache.getDayUsingDayjs(maxDate.subtract(i, 'day'));
    recentWholeTotal += wholeDateCounts.get(d) ?? 0;
    variantDailyCounts.forEach((counts, index) => {
      recentVariantTotal[index] += counts.get(d) ?? 0;
    });
  }

  return variantsSampleSets.map(({ selector }, i) => ({
    selector,
    chartData: filledData[i],
    recentProportion: recentVariantTotal[i] / recentWholeTotal,
  }));
}
