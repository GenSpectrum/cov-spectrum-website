import React, { useEffect, useMemo, useState } from 'react';
import { AsyncState } from 'react-async';
import styled from 'styled-components';
import { VariantSelector } from '../../helpers/sample-selector';
import { SampleSetWithSelector } from '../../helpers/sample-set';
import { getPangolinLineages, SamplingStrategy } from '../../services/api';
import { Country, Variant } from '../../services/api-types';
import { KnownVariantCard } from './KnownVariantCard';
import {
  convertKnownVariantChartData,
  KnownVariantWithSampleSet,
  loadKnownVariantSampleSets,
} from './load-data';
import dayjs from 'dayjs';
import { Typeahead } from 'react-bootstrap-typeahead';
import _VARIANT_LISTS from './variantLists.json';
import { KnownVariantsListSelection } from './KnownVariantsListSelection';

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
  wholeSampleSetState: AsyncState<SampleSetWithSelector>;
}

const Grid = styled.div`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
`;

export type NamedVariantSelector = VariantSelector & { variant: { name: string } };

export type VariantList = {
  name: string;
  variants: NamedVariantSelector[];
  source?: string;
  fillUpUntil: number;
};

const SearchWrapper = styled.div`
  margin-bottom: 10px;
`;

function selectPreviewVariants(
  definedVariants: NamedVariantSelector[],
  pangolinLineages: {
    pangolinLineage: string;
    count: number;
  }[],
  numberVariants: number
): NamedVariantSelector[] {
  const variants = [...definedVariants];
  for (let pangolinLineage of pangolinLineages) {
    if (variants.length >= numberVariants) {
      break;
    }
    if (
      ['B.1.1.7', 'B.1.351', 'P.1'].includes(pangolinLineage.pangolinLineage) ||
      pangolinLineage.pangolinLineage.startsWith('B.1.617')
    ) {
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

export const KnownVariantsList = ({
  country,
  samplingStrategy,
  onVariantSelect,
  selection,
  wholeSampleSetState,
}: Props) => {
  const [selectedVariantList, setSelectedVariantList] = useState(VARIANT_LISTS[0].name);
  const [variantSampleSets, setVariantSampleSets] = useState<
    KnownVariantWithSampleSet<NamedVariantSelector>[]
  >();
  const [pangolinLineages, setPangolinLineages] = useState<
    {
      pangolinLineage: string;
      count: number;
    }[]
  >([]);
  const [knownVariantSelectors, setKnownVariantSelectors] = useState<NamedVariantSelector[]>([]);

  const knownVariantsWithoutData: {
    selector: NamedVariantSelector;
    chartData?: number[];
    recentProportion?: number;
  }[] = knownVariantSelectors.map(selector => ({ selector }));

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;

    getPangolinLineages(
      {
        country,
        samplingStrategy,
        dateFrom: dayjs().subtract(3, 'months').day(1).format('YYYY-MM-DD'),
      },
      signal
    )
      .then(data => {
        if (isSubscribed) {
          const lineages = data.filter(d => d.pangolinLineage !== null).sort((a, b) => b.count - a.count) as {
            pangolinLineage: string;
            count: number;
          }[];
          setPangolinLineages(lineages);
          const variantList = VARIANT_LISTS.filter(({ name }) => name === selectedVariantList)[0];
          setKnownVariantSelectors(
            selectPreviewVariants(variantList.variants, lineages, variantList.fillUpUntil)
          );
        }
      })
      .catch(err => {
        console.error(err);
      });

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, samplingStrategy, selectedVariantList]);

  useEffect(() => {
    setVariantSampleSets(undefined);

    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;

    loadKnownVariantSampleSets({ variantSelectors: knownVariantSelectors, country, samplingStrategy }, signal)
      .then(data => {
        if (isSubscribed) {
          setVariantSampleSets(data);
        }
      })
      .catch(err => {
        console.error(err);
      });

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, samplingStrategy, knownVariantSelectors]);

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
    <>
      <SearchWrapper>
        <Typeahead
          id='pangolinLineageSearch'
          options={pangolinLineages}
          labelKey='pangolinLineage'
          placeholder='Search pangolin lineage (B.1, B.1.1.7, B.1.*)'
          selected={[]}
          onChange={selected =>
            selected.length === 1 &&
            onVariantSelect({
              variant: {
                name: selected[0].pangolinLineage,
                mutations: [],
              },
              matchPercentage: 1,
            })
          }
          allowNew={true}
          selectHintOnEnter={true}
        />
      </SearchWrapper>

      <KnownVariantsListSelection
        variantLists={VARIANT_LISTS}
        selected={selectedVariantList}
        onSelect={setSelectedVariantList}
      />

      <Grid>
        {knownVariants.map(({ selector, chartData, recentProportion }) => (
          <KnownVariantCard
            key={selector.variant.name}
            name={selector.variant.name}
            chartData={chartData}
            recentProportion={recentProportion}
            onClick={() => onVariantSelect(selector)}
            selected={selection?.variant.name === selector.variant.name}
          />
        ))}
      </Grid>
    </>
  );
};
