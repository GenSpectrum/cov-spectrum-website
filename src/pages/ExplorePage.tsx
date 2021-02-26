import React from 'react';
import { KnownVariantsList } from '../components/KnownVariantsList';
import { MutationLookup } from '../components/MutationLookup';
import { NamedSection } from '../components/NamedSection';
import { NewVariantLookup } from '../components/NewVariantLookup';
import { Country, Variant } from '../services/api-types';
import { ScrollableTabs } from '../components/ScrollableTabs';

interface Props {
  country: Country;
  onVariantSelect: (selection: { variant: Variant; matchPercentage: number }) => void;
}

export const ExplorePage = ({ country, onVariantSelect }: Props) => {
  return (
    <ScrollableTabs
      tabs={[
        {
          key: 'explore',
          title: 'Explore',
          content: (
            <>
              <NamedSection title='Known variants'>
                <KnownVariantsList
                  country={country}
                  onVariantSelect={variant => onVariantSelect({ variant, matchPercentage: 0.8 })}
                />
              </NamedSection>
              <NamedSection title='Potential new variants'>
                <NewVariantLookup
                  country={country}
                  onVariantSelect={variant => onVariantSelect({ variant, matchPercentage: 1 })}
                />
              </NamedSection>
              <NamedSection title='Search by mutations'>
                <MutationLookup onVariantSelect={onVariantSelect} />
              </NamedSection>
            </>
          ),
        },
      ]}
    />
  );
};
