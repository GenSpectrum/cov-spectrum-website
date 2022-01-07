import React from 'react';
import { KnownVariantsList } from '../components/KnownVariantsList/KnownVariantsList';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { VariantSelector } from '../data/VariantSelector';
import { useExploreUrl } from '../helpers/explore-url';

interface Props {
  onVariantSelect: (selection: VariantSelector) => void;
  selection: VariantSelector | undefined;
  wholeDateCountSampleDataset: DateCountSampleDataset;
  isSmallExplore: boolean;
}

//small explore means the explore section is small (for mobile)
export const ExplorePage = ({
  onVariantSelect,
  selection,
  wholeDateCountSampleDataset,
  isSmallExplore,
}: Props) => {
  const exploreUrl = useExploreUrl();
  if (!exploreUrl) {
    return null;
  }
  return (
    <div id='explore-selectors'>
      <KnownVariantsList
        onVariantSelect={onVariantSelect}
        wholeDateCountSampleDataset={wholeDateCountSampleDataset}
        variantSelector={selection}
        isHorizontal={isSmallExplore}
        isLandingPage={false}
      />
    </div>
  );
};
