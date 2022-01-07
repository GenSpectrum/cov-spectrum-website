import React from 'react';
import { KnownVariantsList } from '../components/KnownVariantsList/KnownVariantsList';
import { ShowMoreButton } from '../helpers/ui';
import { VariantSearch } from '../components/VariantSearch';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { SequencingIntensityChartWidget } from '../widgets/SequencingIntensityChartWidget';
import { VariantSelector } from '../data/VariantSelector';
import { useExploreUrl } from '../helpers/explore-url';
import { CaseCountAsyncDataset } from '../data/CaseCountDataset';
import { MetadataAvailabilityChartWidget } from '../widgets/MetadataAvailabilityChartWidget';
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { DatelessCountrylessCountSampleData } from '../data/sample/DatelessCountrylessCountSampleDataset';

interface Props {
  onVariantSelect: (selection: VariantSelector) => void;
  selection: VariantSelector | undefined;
  wholeDateCountSampleDataset: DateCountSampleDataset;
  caseCountDataset: CaseCountAsyncDataset;
  wholeDataset: DetailedSampleAggDataset;
  isSmallExplore: boolean;
  isLandingPage?: boolean;
}

//small explore means the explore section is small (for mobile)
export const ExplorePage = ({
  onVariantSelect,
  selection,
  wholeDateCountSampleDataset,
  caseCountDataset,
  wholeDataset,
  isSmallExplore,
  isLandingPage = false,
}: Props) => {
  const exploreUrl = useExploreUrl();
  if (!exploreUrl) {
    return null;
  }
  return (
    <div>
      {isLandingPage ? (
        <div className={`w-full mx-auto max-w-6xl mt-4`}>
          <div className='p-2 mr-4 '>
            <h1>Detect and analyze variants of SARS-CoV-2</h1>
            <VariantSearch
              onVariantSelect={onVariantSelect}
              currentSelection={selection}
              isSimple={isSmallExplore}
            />
          </div>
          <div className={`grid ${isSmallExplore ? '' : 'grid-cols-2'} h-full`}>
            <div className='p-2'>
              <h1 className='mt-4'>Known variants</h1>
              <p>Which variant would you like to explore?</p>
              <KnownVariantsList
                onVariantSelect={onVariantSelect}
                wholeDateCountSampleDataset={wholeDateCountSampleDataset}
                variantSelector={selection}
                isHorizontal={false}
                isLandingPage={isLandingPage}
              />
            </div>
            <div className='p-2'>
              <SequencingIntensityChartWidget.ShareableComponent
                title='Sequencing intensity'
                sequencingCounts={wholeDateCountSampleDataset}
                caseCounts={caseCountDataset}
                height={300}
                toolbarChildren={
                  <ShowMoreButton to={exploreUrl.getDeepExplorePageUrl('/sequencing-coverage')} />
                }
              />
              <div>
                <MetadataAvailabilityChartWidget.ShareableComponent
                  title='Metadata Availability'
                  sampleSet={DatelessCountrylessCountSampleData.fromDetailedSampleAggDataset(wholeDataset)}
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div id='explore-selectors'>
            <KnownVariantsList
              onVariantSelect={onVariantSelect}
              wholeDateCountSampleDataset={wholeDateCountSampleDataset}
              variantSelector={selection}
              isHorizontal={isSmallExplore}
              isLandingPage={isLandingPage}
            />
          </div>
        </>
      )}
    </div>
  );
};
