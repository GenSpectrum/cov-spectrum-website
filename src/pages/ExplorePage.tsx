import React from 'react';
import { KnownVariantsList } from '../components/KnownVariantsList';
import { MutationLookup } from '../components/MutationLookup';
import { NamedSection } from '../components/NamedSection';
import { Country } from '../services/api-types';
import { ScrollableTabs } from '../components/ScrollableTabs';
import { VariantSelector } from '../helpers/sample-selector';
import { NewVariantTable } from '../components/NewVariantTable';

interface Props {
  country: Country;
  onVariantSelect: (selection: VariantSelector) => void;
  selection: VariantSelector | undefined;
}

export const ExplorePage = ({ country, onVariantSelect, selection }: Props) => {
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
                  onVariantSelect={onVariantSelect}
                  selection={selection}
                />
              </NamedSection>
              <NamedSection title='Interesting variants'>
                <NewVariantTable
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
