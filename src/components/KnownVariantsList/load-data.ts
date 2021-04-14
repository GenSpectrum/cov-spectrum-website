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
  }: {
    variantSelectors: T[];
    country: Country;
    samplingStrategy: SamplingStrategy;
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
          dataType: toLiteralSamplingStrategy(samplingStrategy),
          // We don't need very old data, since convertKnownVariantChartData will only
          // take the latest 2 months. However since our data collection lags by a couple
          // of weeks, we need to fetch slightly more here to ensure we have enough.
          dateFrom: dayjs().subtract(3, 'months').day(1).format('YYYY-MM-DD'),
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
export function convertKnownVariantChartData<T extends VariantSelector>({
  variantSampleSets: variantsSampleSets,
  wholeSampleSet,
}: {
  variantSampleSets: KnownVariantWithSampleSet<T>[];
  wholeSampleSet: SampleSetWithSelector;
}): KnownVariantWithChartData<T>[] {
  if (!variantsSampleSets.length) {
    return [];
  }

  const variantWeeklyCounts = variantsSampleSets.flatMap(s => s.sampleSet.countByWeek());
  const wholeWeeklyCounts = wholeSampleSet.countByWeek();

  const dataWeekRange = globalDateCache.rangeFromWeeks(
    [...variantWeeklyCounts.values()].flatMap(map => [...map.keys()])
  )!;
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

  return variantsSampleSets.map(({ selector }, i) => ({ selector, chartData: filledData[i] }));
}
