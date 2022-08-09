import React, { useEffect, useMemo, useState } from 'react';
import { KnownVariantCard } from './KnownVariantCard';
import { KnownVariantsListSelection } from './KnownVariantsListSelection';
import { DateCountSampleData, DateCountSampleDataset } from '../../data/sample/DateCountSampleDataset';
import { SpecialDateRangeSelector } from '../../data/DateRangeSelector';
import { formatVariantDisplayName, VariantSelector } from '../../data/VariantSelector';
import { globalDateCache } from '../../helpers/date-cache';
import assert from 'assert';
import dayjs from 'dayjs';
import { useQuery } from '../../helpers/query-hook';
import { AnalysisMode } from '../../data/AnalysisMode';
import { HostAndQcSelector } from '../../data/HostAndQcSelector';
import { LapisSelector } from '../../data/LapisSelector';
import { fetchCollections } from '../../data/api';
import { Collection, CollectionVariant } from '../../data/Collection';

const getLoadVariantCardLoaders = (numberCards: number) => {
  let loaders = [];
  for (let i = 0; i < numberCards; i++) {
    loaders.push(
      <div className='animate-pulse w-full' key={i}>
        <div className={`h-20 bg-gradient-to-r from-gray-400 to-gray-300 rounded w-full`} />
      </div>
    );
  }
  return loaders;
};

export interface KnownVariantWithChartData {
  selector: VariantSelector;
  name: string;
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
  variantSampleSets: {
    variant: CollectionVariant;
    data: DateCountSampleDataset;
  }[];
  wholeSampleSet: DateCountSampleDataset;
}): KnownVariantWithChartData[] {
  // Compute the weekly chart data
  const variantWeeklyCounts = variantSampleSets.map(({ data }) =>
    DateCountSampleData.countByWeek(data.payload)
  );
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
  const variantDailyCounts = variantSampleSets.map(s => DateCountSampleData.countByDay(s.data.payload));
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

  return variantSampleSets.map(({ variant, data }, i) => ({
    selector: data.selector.variant!,
    name: variant.name,
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
  onVariantSelect: (selection: VariantSelector[], analysisMode?: AnalysisMode) => void;
  variantSelector: VariantSelector | VariantSelector[] | undefined;
  wholeDateCountSampleDataset: DateCountSampleDataset;
  hostAndQc: HostAndQcSelector;
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
  hostAndQc,
  wholeDateCountSampleDataset,
  isHorizontal = false,
  isLandingPage,
}: Props) => {
  const [selectedVariantList, setSelectedVariantList] = useState(1); // This is the ID of Editor's choice
  const [chartData, setChartData] = useState<KnownVariantWithChartData[] | undefined>(undefined);

  // Load collections
  const { data: collections } = useQuery(
    signal => fetchCollections(signal).then(collections => collections.sort((a, b) => a.id! - b.id!)),
    []
  );
  const selectedCollection = useMemo(
    () => (collections ? collections.find(c => c.id === selectedVariantList) : undefined),
    [collections, selectedVariantList]
  );

  const KnownVariantLoader = () => {
    const loaders = getLoadVariantCardLoaders(selectedCollection?.variants.length ?? 12);
    return (
      <Grid isHorizontal={isHorizontal} isLandingPage={isLandingPage}>
        {loaders}
      </Grid>
    );
  };

  useEffect(() => {
    setChartData(undefined);
    if (!selectedCollection) {
      return;
    }

    const createSelector = (
      variantSelector: VariantSelector,
      hostAndQc: HostAndQcSelector
    ): LapisSelector => {
      return {
        location: wholeDateCountSampleDataset.selector.location,
        dateRange: new SpecialDateRangeSelector('Past3M'),
        variant: variantSelector,
        samplingStrategy: wholeDateCountSampleDataset.selector.samplingStrategy,
        ...hostAndQc,
      };
    };

    async function fetchAll(collection: Collection) {
      return await Promise.all(
        // TODO handle broken variant queries
        collection.variants.map(async variant => {
          const selector = createSelector(JSON.parse(variant.query) as VariantSelector, hostAndQc);
          return {
            variant: variant,
            data: await DateCountSampleData.fromApi(selector),
          };
        })
      );
    }
    fetchAll(selectedCollection).then(sampleSets => {
      const _chartData = convertKnownVariantChartData({
        variantSampleSets: sampleSets,
        wholeSampleSet: wholeDateCountSampleDataset,
      });
      setChartData(_chartData);
    });
  }, [selectedCollection, wholeDateCountSampleDataset, hostAndQc]);

  if (!chartData || !collections) {
    return (
      <div className='mt-2'>
        <KnownVariantLoader />{' '}
      </div>
    );
  }

  return (
    <>
      <KnownVariantsListSelection
        collections={collections}
        selected={selectedVariantList}
        onSelect={setSelectedVariantList}
      />
      <Grid isHorizontal={isHorizontal} isLandingPage={isLandingPage}>
        {chartData.map(({ selector, name, chartData, recentProportion }) => (
          <div className={`${isHorizontal && 'h-full w-36'}`} key={formatVariantDisplayName(selector, true)}>
            <KnownVariantCard
              key={formatVariantDisplayName(selector, true)}
              name={name}
              chartData={chartData}
              recentProportion={recentProportion}
              onClick={() => {
                onVariantSelect([selector], AnalysisMode.Single);
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
