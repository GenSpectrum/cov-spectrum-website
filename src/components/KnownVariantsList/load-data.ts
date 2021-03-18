import assert from 'assert';
import { fillWeeklyApiData } from '../../helpers/fill-missing';
import { VariantSelector } from '../../helpers/sample-selector';
import { dayjsToYearWeekWithDay, yearWeekWithDayToDayjs } from '../../helpers/week';
import {
  DistributionType,
  getVariantDistributionData,
  SamplingStrategy,
  toLiteralSamplingStrategy,
} from '../../services/api';
import { Country, YearWeekWithDay } from '../../services/api-types';

interface KnownVariantWithChartData<T extends VariantSelector> {
  selector: T;
  chartData: number[]; // proportion (0-1) per week
}

// loadKnownVariantChartData loads the latest 2 month window of data
// in which the proportion for some variants was known. Data for every variant
// is clipped to the same window.
export async function loadKnownVariantChartData<T extends VariantSelector>(
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
): Promise<KnownVariantWithChartData<T>[]> {
  if (!variantSelectors.length) {
    return [];
  }

  const rawData = await Promise.all(
    variantSelectors.map(selector =>
      getVariantDistributionData(
        {
          distributionType: DistributionType.Time,
          country,
          mutations: selector.variant.mutations,
          matchPercentage: selector.matchPercentage,
          samplingStrategy: toLiteralSamplingStrategy(samplingStrategy),
        },
        signal
      )
    )
  );

  const plotEndWeek = rawData
    .flatMap(rawDataForVariant => rawDataForVariant.map(({ x }) => yearWeekWithDayToDayjs(x)))
    .reduce((a, b) => (a.isAfter(b) ? a : b));
  const plotStartWeek = plotEndWeek.subtract(8, 'weeks');

  type DataWithDummy = { x: YearWeekWithDay; y: number | 'dummy' };
  const dummyItems: DataWithDummy[] = [
    { x: dayjsToYearWeekWithDay(plotStartWeek.subtract(1, 'week')), y: 'dummy' },
    { x: dayjsToYearWeekWithDay(plotEndWeek.add(1, 'week')), y: 'dummy' },
  ];

  const filledData = rawData.map(rawDataForVariant => {
    const dataBeforeFill: DataWithDummy[] = rawDataForVariant
      .map(({ x, y }) => ({ x, y: y.proportion.value }))
      .filter(({ x }) => {
        const xAsDayJs = yearWeekWithDayToDayjs(x);
        return !xAsDayJs.isBefore(plotStartWeek) && !xAsDayJs.isAfter(plotEndWeek);
      });
    dataBeforeFill.push(...dummyItems);
    return fillWeeklyApiData(dataBeforeFill, 0)
      .filter(({ y }) => typeof y === 'number')
      .map(({ y }) => y as number);
  });

  assert(new Set(filledData.map(d => d.length)).size === 1);

  return variantSelectors.map((selector, i) => ({ selector, chartData: filledData[i] }));
}
