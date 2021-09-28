import React, { useMemo, useState } from 'react';
import { AsyncState } from 'react-async';
import styled from 'styled-components';
import { VariantSelector } from '../../helpers/sample-selector';
import { SampleSetWithSelector } from '../../helpers/sample-set';
import {
  DateRange,
  dateRangeToDates,
  getPangolinLineages,
  PromiseWithCancel,
  SamplingStrategy,
} from '../../services/api';
import { Country, PangolinLineageList, Variant } from '../../services/api-types';
import { KnownVariantCard } from './KnownVariantCard';
import {
  convertKnownVariantChartData,
  KnownVariantWithSampleSet,
  loadKnownVariantSampleSets,
} from './load-data';
import dayjs from 'dayjs';
import _VARIANT_LISTS from './variantLists.json';
import { KnownVariantsListSelection } from './KnownVariantsListSelection';
import { formatVariantDisplayName } from '../../helpers/variant-selector';
import { useQuery } from 'react-query';
import { KnownVariantLoader } from '../Loader';
import { Alert, AlertVariant } from '../../helpers/ui';
import { useWholeSampleSet } from '../../pages/ExploreFocusSplit';

const VARIANT_LISTS: VariantList[] = _VARIANT_LISTS;

export interface SelectedVariantAndCountry {
  variant: Variant;
  country?: Country;
}

interface Props {
  country: Country;
  samplingStrategy: SamplingStrategy;
  onVariantSelect: (selection: VariantSelector) => void;
  selection: VariantSelector | undefined;
}

export const Grid = styled.div`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
`;

export type VariantList = {
  name: string;
  variants: VariantSelector[];
  source?: string;
  fillUpUntil: number;
};

function selectPreviewVariants(
  definedVariants: VariantSelector[],
  pangolinLineages: {
    pangolinLineage: string;
    count: number;
  }[],
  numberVariants: number
): VariantSelector[] {
  const variants = [...definedVariants];
  for (let pangolinLineage of pangolinLineages) {
    if (variants.length >= numberVariants) {
      break;
    }
    if (variants.map(v => v.variant.name?.replace(/\*/g, '')).includes(pangolinLineage.pangolinLineage)) {
      continue;
    }
    variants.push({
      variant: {
        name: pangolinLineage.pangolinLineage,
        mutations: [],
      },
      matchPercentage: 1,
    });
  }
  return variants;
}

/**
 * For KnownVariantsList, we don't need very old data, since convertKnownVariantChartData (in load-data.ts)
 * will only take the latest 2 months. However since our data collection lags by a couple
 * of weeks, we need to fetch slightly more here to ensure we have enough. Therefore,
 * we use past 3 months (Past3M) as the date range across all API calls within KnownVariantsList,
 * e.g. useWholeSampleSet, getPangolinLineages, loadKnownVariantSampleSets.
 */
export const KnownVariantsList = ({ country, samplingStrategy, onVariantSelect, selection }: Props) => {
  const [selectedVariantList, setSelectedVariantList] = useState(VARIANT_LISTS[0].name);
  const [variantSampleSets, setVariantSampleSets] = useState<KnownVariantWithSampleSet<VariantSelector>[]>();
  const [knownVariantSelectors, setKnownVariantSelectors] = useState<VariantSelector[]>([]);

  const dateRange: DateRange = 'Past3M';
  const { dateFrom, dateTo } = dateRangeToDates(dateRange);
  const wholeSampleSetState: AsyncState<SampleSetWithSelector> = useWholeSampleSet({
    country,
    samplingStrategy,
    dateRange,
  });

  const knownVariantsWithoutData: {
    selector: VariantSelector;
    chartData?: number[];
    recentProportion?: number;
  }[] = knownVariantSelectors.map(selector => ({ selector }));

  const fetchPangolinLineages = () => {
    const controller = new AbortController();
    const signal = controller.signal;
    const promise = getPangolinLineages(
      {
        country,
        samplingStrategy,
        dateFrom: dateFrom && dayjs(dateFrom).format('YYYY-MM-DD'),
        dateTo: dateTo && dayjs(dateTo).format('YYYY-MM-DD'),
      },
      signal
    ).then(data => {
      const lineages = data.filter(d => d.pangolinLineage !== null).sort((a, b) => b.count - a.count) as {
        pangolinLineage: string;
        count: number;
      }[];
      const variantList = VARIANT_LISTS.filter(({ name }) => name === selectedVariantList)[0];
      setKnownVariantSelectors(
        selectPreviewVariants(variantList.variants, lineages, variantList.fillUpUntil)
      );
      return data;
    });
    (promise as PromiseWithCancel<PangolinLineageList>).cancel = () => controller.abort();
    return promise;
  };

  const {
    isFetching: isPLFetching,
    isError: isPLError,
    error: pLError,
    isLoading: isPLLoading,
    isSuccess: isPLSuccess,
  } = useQuery<PangolinLineageList, Error>(
    ['pangolinLineages', country, samplingStrategy, selectedVariantList],
    fetchPangolinLineages
  );

  const fetchKnownVariantSampleSets = () => {
    const controller = new AbortController();
    const signal = controller.signal;
    const promise = loadKnownVariantSampleSets(
      {
        variantSelectors: knownVariantSelectors,
        country,
        samplingStrategy,
        dateFrom: dateFrom && dayjs(dateFrom).format('YYYY-MM-DD'),
        dateTo: dateTo && dayjs(dateTo).format('YYYY-MM-DD'),
      },
      signal
    ).then(data => {
      setVariantSampleSets(data);
      return data;
    });
    (promise as PromiseWithCancel<KnownVariantWithSampleSet<VariantSelector>[]>).cancel = () =>
      controller.abort();
    return promise;
  };

  const {
    isFetching: isKVFetching,
    isError: isKVError,
    error: kVError,
    isLoading: isKVLoading,
    isSuccess: isKVSuccess,
  } = useQuery<KnownVariantWithSampleSet<VariantSelector>[], Error>(
    ['knownVariantsSampleSets', country, samplingStrategy, knownVariantSelectors],
    fetchKnownVariantSampleSets
  );

  const knownVariants = useMemo(() => {
    if (variantSampleSets === undefined || !wholeSampleSetState.isResolved) {
      return knownVariantsWithoutData;
    }
    return convertKnownVariantChartData({
      variantSampleSets,
      wholeSampleSet: wholeSampleSetState.data,
    });
  }, [variantSampleSets, wholeSampleSetState, knownVariantsWithoutData]);

  return (
    <div className='mt-2'>
      {isPLError && pLError && <Alert variant={AlertVariant.DANGER}>{pLError.message}</Alert>}
      {isKVError && kVError && <Alert variant={AlertVariant.DANGER}>{kVError.message}</Alert>}
      {wholeSampleSetState.status === 'rejected' && (
        <Alert variant={AlertVariant.DANGER}>Failed to load samples</Alert>
      )}
      {isPLSuccess && isKVSuccess ? (
        <Grid>
          {knownVariants.map(({ selector, chartData, recentProportion }) => (
            <KnownVariantCard
              key={formatVariantDisplayName(selector.variant, true)}
              name={formatVariantDisplayName(selector.variant, true)}
              chartData={chartData}
              recentProportion={recentProportion}
              onClick={() => onVariantSelect(selector)}
              selected={
                selection &&
                formatVariantDisplayName(selection.variant, true) ===
                  formatVariantDisplayName(selector.variant, true)
              }
            />
          ))}
        </Grid>
      ) : (
        <KnownVariantLoader />
      )}
      <KnownVariantsListSelection
        variantLists={VARIANT_LISTS}
        selected={selectedVariantList}
        onSelect={setSelectedVariantList}
      />
    </div>
  );
};
