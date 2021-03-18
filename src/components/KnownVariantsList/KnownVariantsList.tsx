import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { VariantSelector } from '../../helpers/sample-selector';
import { SamplingStrategy } from '../../services/api';
import { Country, Variant } from '../../services/api-types';
import knownVariantSelectors from './known-variants.json';
import { KnownVariantCard } from './KnownVariantCard';
import { loadKnownVariantChartData } from './load-data';

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

const Grid = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
`;

const knownVariantsWithoutData: {
  selector: VariantSelector & { variant: { name: string } };
  chartData?: number[];
}[] = knownVariantSelectors.map(selector => ({ selector }));

export const KnownVariantsList = ({ country, samplingStrategy, onVariantSelect, selection }: Props) => {
  const [knownVariants, setKnownVariants] = useState(knownVariantsWithoutData);

  useEffect(() => {
    setKnownVariants(knownVariantsWithoutData);

    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;

    loadKnownVariantChartData({ variantSelectors: knownVariantSelectors, country, samplingStrategy }, signal)
      .then(data => {
        if (isSubscribed) {
          setKnownVariants(data);
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
