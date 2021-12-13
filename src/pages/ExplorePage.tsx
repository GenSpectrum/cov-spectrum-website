import React from 'react';
import styled from 'styled-components';
import { ExternalLink } from '../components/ExternalLink';
import { KnownVariantsList } from '../components/KnownVariantsList/KnownVariantsList';
import { NamedSection } from '../components/NamedSection';
import { VercelSponsorshipLogo } from '../components/VercelSponsorshipLogo';
import { ShowMoreButton } from '../helpers/ui';
import { VariantSearch } from '../components/VariantSearch';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { SequencingIntensityChartWidget } from '../widgets/SequencingIntensityChartWidget';
import { VariantSelector } from '../data/VariantSelector';
import { useExploreUrl } from '../helpers/explore-url';
import { getCurrentLapisDataVersionDate } from '../data/api-lapis';
import dayjs from 'dayjs';
import { sequenceDataSource } from '../helpers/sequence-data-source';
import { CaseCountAsyncDataset } from '../data/CaseCountDataset';
import { MetadataAvailabilityChartWidget } from '../widgets/MetadataAvailabilityChartWidget';
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';

const Footer = styled.footer`
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid darkgray;
  font-size: small;
`;
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
  const isWideLandingPage = !isSmallExplore && isLandingPage;
  const exploreUrl = useExploreUrl();
  if (!exploreUrl) {
    return null;
  }
  return (
    <div className={`w-full`}>
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
                  sampleSet={wholeDataset}
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div id='explore-search-bar' className={`${isWideLandingPage ? 'mt-8' : 'mt-4'}`}>
            <VariantSearch
              onVariantSelect={onVariantSelect}
              currentSelection={selection}
              isSimple={isSmallExplore}
            />
          </div>
          <div id='explore-selectors'>
            <KnownVariantsList
              onVariantSelect={onVariantSelect}
              wholeDateCountSampleDataset={wholeDateCountSampleDataset}
              variantSelector={selection}
              isHorizontal={isSmallExplore}
            />
            {!isSmallExplore ? (
              <div className='w-full h-full'>
                <SequencingIntensityChartWidget.ShareableComponent
                  title='Sequencing intensity'
                  sequencingCounts={wholeDateCountSampleDataset}
                  caseCounts={caseCountDataset}
                  height={300}
                  widgetLayout={NamedSection}
                  toolbarChildren={
                    <ShowMoreButton to={exploreUrl.getDeepExplorePageUrl('/sequencing-coverage')} />
                  }
                />
                <Footer>
                  <div>
                    The sequence data was updated on: {dayjs(getCurrentLapisDataVersionDate()).toISOString()}
                  </div>
                  {sequenceDataSource === 'gisaid' && (
                    <div>
                      Data obtained from GISAID that is used in this Web Application remain subject to
                      GISAID’s <ExternalLink url='http://gisaid.org/daa'>Terms and Conditions</ExternalLink>.
                    </div>
                  )}
                  <VercelSponsorshipLogo />
                </Footer>
              </div>
            ) : (
              <br></br>
            )}
          </div>
        </>
      )}
    </div>
  );
};
