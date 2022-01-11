import React, { useEffect, useMemo, useState } from 'react';
import { KnownVariantCard } from './KnownVariantCard';
import _VARIANT_LISTS from './variantLists.json';
import { KnownVariantsListSelection } from './KnownVariantsListSelection';
import { DateCountSampleData, DateCountSampleDataset } from '../../data/sample/DateCountSampleDataset';
import { PangoCountSampleData } from '../../data/sample/PangoCountSampleDataset';
import { SpecialDateRangeSelector } from '../../data/DateRangeSelector';
import { PangoCountSampleEntry } from '../../data/sample/PangoCountSampleEntry';
import { formatVariantDisplayName, VariantSelector } from '../../data/VariantSelector';
import { LocationDateVariantSelector } from '../../data/LocationDateVariantSelector';
import { globalDateCache } from '../../helpers/date-cache';
import assert from 'assert';
import dayjs from 'dayjs';
import { useQuery } from '../../helpers/query-hook';

const VARIANT_LISTS: VariantList[] = _VARIANT_LISTS;

const getLoadVariantCardLoaders = () => {
  let loaders = [];
  for (let i = 0; i < 12; i++) {
    loaders.push(
      <div className='animate-pulse w-full' key={i}>
        <div className={`h-20 bg-gradient-to-r from-gray-400 to-gray-300 rounded w-full`} />
      </div>
    );
  }
  return loaders;
};

export type VariantList = {
  name: string;
  variants: VariantSelector[];
  source?: string;
  fillUpUntil: number;
};

function selectPreviewVariants(
  definedVariants: VariantSelector[],
  pangoLineageCounts: PangoCountSampleEntry[],
  numberVariants: number
): VariantSelector[] {
  const variants = [...definedVariants];
  pangoLineageCounts.sort((a, b) => b.count - a.count);
  for (let { pangoLineage } of pangoLineageCounts) {
    if (variants.length >= numberVariants) {
      break;
    }
    if (!pangoLineage) {
      continue;
    }
    if (variants.map(v => v.pangoLineage?.replace(/\*/g, '')).includes(pangoLineage)) {
      continue;
    }
    variants.push({
      pangoLineage: pangoLineage,
    });
  }
  return variants;
}

export interface KnownVariantWithChartData {
  selector: VariantSelector;
  chartData: number[]; // proportion (0-1) per week
  recentProportion: number; // the proportion of the last 14 days
}

// convertKnownVariantChartData converts SampleSets into the format required
// by the known variant plots. It takes the latest 2 month window of data
// in which the proportion for some variants was known. Data for every variant
// is clipped to the same window.
// Further, it computes the proportion from the sequencing data of the last 14
// days, again ensuring that the same time window is used for every variant.
export function convertKnownVariantChartData({
  variantSampleSets,
  wholeSampleSet,
}: {
  variantSampleSets: DateCountSampleDataset[];
  wholeSampleSet: DateCountSampleDataset;
}): KnownVariantWithChartData[] {
  // Compute the weekly chart data
  const variantWeeklyCounts = variantSampleSets.map(s => DateCountSampleData.countByWeek(s.payload));
  const wholeWeeklyCounts = DateCountSampleData.countByWeek(wholeSampleSet.payload);

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
  const variantDailyCounts = variantSampleSets.map(s => DateCountSampleData.countByDay(s.payload));
  const wholeDateCounts = DateCountSampleData.countByDay(wholeSampleSet.payload);
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

  return variantSampleSets.map((dataset, i) => ({
    selector: dataset.selector.variant!,
    chartData: filledData[i],
    recentProportion: recentVariantTotal[i] / recentWholeTotal,
  }));
}

const Grid = ({
  children,
  isHorizontal,
  isLandingPage,
}: {
  children: JSX.Element[] | JSX.Element;
  isHorizontal: boolean;
  isLandingPage: boolean;
}) => {
  return (
    <div className={`w-full ${isHorizontal ? 'overflow-x-scroll' : ''}`}>
      <div
        className={`w-full grid gap-x-2 md:gap-2 ${
          isHorizontal
            ? 'w-max grid-flow-col overflow-hidden auto-rows-min auto-cols-min'
            : isLandingPage
            ? 'grid-cols-2'
            : 'grid-cols-1'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

interface Props {
  onVariantSelect: (selection: VariantSelector) => void;
  variantSelector: VariantSelector | VariantSelector[] | undefined;
  wholeDateCountSampleDataset: DateCountSampleDataset;
  isHorizontal: boolean;
  isLandingPage: boolean;
}

/**
 * For KnownVariantsList, we don't need very old data, since convertKnownVariantChartData (in load-data.ts)
 * will only take the latest 2 months. However since our data collection lags by a couple
 * of weeks, we need to fetch slightly more here to ensure we have enough. Therefore,
 * we use past 3 months (Past3M) as the date range across all API calls within KnownVariantsList,
 * e.g. useWholeSampleSet, getPangolinLineages, loadKnownVariantSampleSets.
 */
export const KnownVariantsList = ({
  onVariantSelect,
  variantSelector,
  wholeDateCountSampleDataset,
  isHorizontal = false,
  isLandingPage,
}: Props) => {
  const [selectedVariantList, setSelectedVariantList] = useState(VARIANT_LISTS[0].name);
  const [chartData, setChartData] = useState<KnownVariantWithChartData[] | undefined>(undefined);

  const KnownVariantLoader = () => {
    const loaders = getLoadVariantCardLoaders();
    return (
      <Grid isHorizontal={isHorizontal} isLandingPage={isLandingPage}>
        {loaders}
      </Grid>
    );
  };

  const pangoCountDataset = useQuery(
    signal =>
      PangoCountSampleData.fromApi(
        {
          location: wholeDateCountSampleDataset.selector.location,
          dateRange: new SpecialDateRangeSelector('Past3M'),
          samplingStrategy: wholeDateCountSampleDataset.selector.samplingStrategy,
        },
        signal
      ),
    [wholeDateCountSampleDataset]
  );
  const knownVariantSelectors = useMemo(() => {
    if (!pangoCountDataset.isSuccess || !pangoCountDataset.data) {
      return [];
    }
    const variantList = VARIANT_LISTS.filter(({ name }) => name === selectedVariantList)[0];
    return selectPreviewVariants(
      variantList.variants,
      pangoCountDataset.data.payload,
      variantList.fillUpUntil
    );
  }, [pangoCountDataset.isSuccess, pangoCountDataset.data, selectedVariantList]);

  useEffect(() => {
    setChartData(undefined);
    if (!knownVariantSelectors) {
      return;
    }

    const createSelector = (variantSelector: VariantSelector): LocationDateVariantSelector => {
      return {
        location: wholeDateCountSampleDataset.selector.location,
        dateRange: new SpecialDateRangeSelector('Past3M'),
        variant: variantSelector,
        samplingStrategy: wholeDateCountSampleDataset.selector.samplingStrategy,
      };
    };

    async function fetchAll(knownVariantSelectors: VariantSelector[]) {
      return await Promise.all(
        knownVariantSelectors.map(vs => {
          const selector = createSelector(vs);
          return DateCountSampleData.fromApi(selector);
        })
      );
    }
    fetchAll(knownVariantSelectors).then(sampleSets => {
      const _chartData = convertKnownVariantChartData({
        variantSampleSets: sampleSets,
        wholeSampleSet: wholeDateCountSampleDataset,
      });
      setChartData(_chartData);
    });
  }, [knownVariantSelectors, wholeDateCountSampleDataset]);

  if (!chartData) {
    return (
      <div className='mt-2'>
        <KnownVariantLoader />{' '}
      </div>
    );
  }

  return (
    <>
      <KnownVariantsListSelection
        variantLists={VARIANT_LISTS}
        selected={selectedVariantList}
        onSelect={setSelectedVariantList}
      />
      <Grid isHorizontal={isHorizontal} isLandingPage={isLandingPage}>
        {chartData.map(({ selector, chartData, recentProportion }) => (
          <div className={`${isHorizontal && 'h-full w-36'}`} key={formatVariantDisplayName(selector, true)}>
            <KnownVariantCard
              key={formatVariantDisplayName(selector, true)}
              name={formatVariantDisplayName(selector, true)}
              chartData={chartData}
              recentProportion={recentProportion}
              onClick={() => {
                onVariantSelect(selector);
              }}
              selected={variantSelector && isSelected(selector, variantSelector)}
            />
          </div>
        ))}
      </Grid>
    </>
  );
};

function isSelected(
  thisSelector: VariantSelector,
  selector: VariantSelector | VariantSelector[] | undefined
): boolean {
  if (selector === undefined) {
    return false;
  }
  let _selectors: VariantSelector[];
  if (Array.isArray(selector)) {
    _selectors = selector;
  } else {
    _selectors = [selector];
  }
  const thisSelectorFormatted = formatVariantDisplayName(thisSelector, true);
  for (let s of _selectors) {
    if (formatVariantDisplayName(s, true) === thisSelectorFormatted) {
      return true;
    }
  }
  return false;
}
