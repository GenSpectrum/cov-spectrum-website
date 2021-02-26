import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { KnownVariantsList } from '../components/KnownVariantsList';
import { MutationLookup } from '../components/MutationLookup';
import { NewVariantLookup } from '../components/NewVariantLookup';
import { Country, Variant } from '../services/api-types';

interface Props {
  country: Country;
  onVariantSelect: (selection: { variant: Variant; matchPercentage: number }) => void;
}

export const ExplorePage = ({ country, onVariantSelect }: Props) => {
  return (
    <Tabs defaultActiveKey='explore' id='variantList' transition={false} unmountOnExit>
      <Tab eventKey='explore' title='Explore'>
        <KnownVariantsList
          country={country}
          onVariantSelect={variant => onVariantSelect({ variant, matchPercentage: 0.8 })}
        />
        <NewVariantLookup
          country={country}
          onVariantSelect={variant => onVariantSelect({ variant, matchPercentage: 1 })}
        />
        <MutationLookup onVariantSelect={onVariantSelect} />
      </Tab>
    </Tabs>
  );
};
