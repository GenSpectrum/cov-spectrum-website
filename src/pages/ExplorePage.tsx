import { KnownVariantsList } from '../components/KnownVariantsList/KnownVariantsList';
import { SequencingIntensityChartWidget } from '../widgets/SequencingIntensityChartWidget';
import { ShowMoreButton } from '../helpers/ui';
import { MetadataAvailabilityChartWidget } from '../widgets/MetadataAvailabilityChartWidget';
import { DatelessCountrylessCountSampleData } from '../data/sample/DatelessCountrylessCountSampleDataset';
import React, { useEffect } from 'react';
import { useExploreUrl } from '../helpers/explore-url';
import { CaseCountAsyncDataset, CaseCountData } from '../data/CaseCountDataset';
import { useAsyncDataset } from '../helpers/use-async-dataset';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import Loader from '../components/Loader';
import { VariantSearch } from '../components/VariantSearch';
import { AnalysisMode } from '../data/AnalysisMode';
import { getLocation } from '../helpers/get-location';
import { useSingleSelectorsFromExploreUrl } from '../helpers/selectors-from-explore-url-hook';

type Props = {
  isSmallScreen: boolean;
};

export const ExplorePage = ({ isSmallScreen }: Props) => {
  const exploreUrl = useExploreUrl();
  const { lsSelector, lSelector, hostAndQc } = useSingleSelectorsFromExploreUrl(exploreUrl!);

  // Fetch data
  const wholeDatelessDataset = useQuery(
    signal => DatelessCountrylessCountSampleData.fromApi(lsSelector, signal),
    [lsSelector]
  );
  const wholeDateCountDataset = useQuery(signal => DateCountSampleData.fromApi(lsSelector, signal), [
    lsSelector,
  ]);
  const caseCountDataset: CaseCountAsyncDataset = useAsyncDataset(lSelector, ({ selector }, { signal }) =>
    CaseCountData.fromApi(selector, signal)
  );

  useEffect(() => {
    // Include the location of interest in the page title
    let place: string = getLocation(exploreUrl);
    document.title = `${place} - covSPECTRUM`;
  });

  if (!exploreUrl) {
    return null;
  }
  if (!wholeDatelessDataset.data || !wholeDateCountDataset.data) {
    return <Loader />;
  }

  return (
    <div className={`w-full mx-auto max-w-6xl mt-4`}>
      <div className='p-2 mr-4 '>
        <h1>Detect and analyze variants of SARS-CoV-2</h1>
        <VariantSearch onVariantSelect={exploreUrl.setVariants} analysisMode={AnalysisMode.Single} />
      </div>
      <div className={`grid ${isSmallScreen ? '' : 'grid-cols-2'} h-full`}>
        <div className='p-2'>
          <h1 className='mt-4'>Known variants</h1>
          <p>Which variant would you like to explore?</p>
          <KnownVariantsList
            onVariantSelect={exploreUrl.setVariants}
            wholeDateCountSampleDataset={wholeDateCountDataset.data}
            variantSelector={undefined}
            hostAndQc={hostAndQc}
            isHorizontal={false}
            isLandingPage={true}
          />
        </div>
        <div className='p-2'>
          <SequencingIntensityChartWidget.ShareableComponent
            title='Sequencing intensity'
            sequencingCounts={wholeDateCountDataset.data}
            caseCounts={caseCountDataset}
            height={300}
            toolbarChildren={<ShowMoreButton to={exploreUrl.getDeepExplorePageUrl('/sequencing-coverage')} />}
          />
          <div>
            <MetadataAvailabilityChartWidget.ShareableComponent
              title='Metadata Availability'
              sampleSet={wholeDatelessDataset.data}
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
