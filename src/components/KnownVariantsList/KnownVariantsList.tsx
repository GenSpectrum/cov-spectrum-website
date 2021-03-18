import React from 'react';
import styled from 'styled-components';
import { VariantSelector } from '../../helpers/sample-selector';
import { Country, Variant } from '../../services/api-types';
import knownVariants from './known-variants.json';
import { KnownVariantCard } from './KnownVariantCard';

export interface SelectedVariantAndCountry {
  variant: Variant;
  country?: Country;
}

interface Props {
  country: Country;
  onVariantSelect: (selection: VariantSelector) => void;
  selection: VariantSelector | undefined;
}

const Grid = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
`;

export const KnownVariantsList = ({ country, onVariantSelect, selection }: Props) => {
  return (
    <Grid>
      {knownVariants.map(selector => (
        <KnownVariantCard
          key={selector.variant.name}
          name={selector.variant.name}
          onClick={() => onVariantSelect(selector)}
          selected={selection?.variant.name === selector.variant.name}
        />
      ))}
    </Grid>
  );
};
