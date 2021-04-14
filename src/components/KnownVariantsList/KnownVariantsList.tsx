import React, { useEffect, useMemo, useState } from 'react';
import { AsyncState } from 'react-async';
import styled from 'styled-components';
import { VariantSelector } from '../../helpers/sample-selector';
import { SampleSetWithSelector } from '../../helpers/sample-set';
import { SamplingStrategy } from '../../services/api';
import { Country, Variant } from '../../services/api-types';
import knownVariantSelectors from './known-variants.json';
import { KnownVariantCard } from './KnownVariantCard';
import {
  convertKnownVariantChartData,
  KnownVariantWithSampleSet,
  loadKnownVariantSampleSets,
} from './load-data';

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
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
`;

type NamedVariantSelector = VariantSelector & { variant: { name: string } };

const knownVariantsWithoutData: {
  selector: NamedVariantSelector;
  chartData?: number[];
}[] = knownVariantSelectors.map(selector => ({ selector }));

export const KnownVariantsList = ({
  country,
  samplingStrategy,
  onVariantSelect,
  selection,
  wholeSampleSetState,
}: Props) => {
  const [variantSampleSets, setVariantSampleSets] = useState<
    KnownVariantWithSampleSet<NamedVariantSelector>[]
  >();

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
  }, [country, samplingStrategy]);

  const knownVariants = useMemo(() => {
    if (variantSampleSets === undefined || !wholeSampleSetState.isResolved) {
      return knownVariantsWithoutData;
    }
    return convertKnownVariantChartData({
      variantSampleSets,
      wholeSampleSet: wholeSampleSetState.data,
    });
  }, [variantSampleSets, wholeSampleSetState]);

  return (
    <Grid>
      {knownVariants.map(({ selector, chartData }) => (
        <KnownVariantCard
          key={selector.variant.name}
          name={selector.variant.name}
          chartData={chartData}
          onClick={() => onVariantSelect(selector)}
          selected={selection?.variant.name === selector.variant.name}
        />
      ))}
    </Grid>
  );
};
