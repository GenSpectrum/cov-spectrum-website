import React from 'react';
import styled from 'styled-components';
import { ExternalLink } from '../components/ExternalLink';
import { KnownVariantsList } from '../components/KnownVariantsList/KnownVariantsList';
import { NamedSection } from '../components/NamedSection';
import { VercelSponsorshipLogo } from '../components/VercelSponsorshipLogo';
import { ShowMoreButton } from '../helpers/ui';
import { VariantSearch } from '../components/VariantSearch';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { CaseCountDataset } from '../data/CaseCountDataset';
import { SequencingIntensityChartWidget } from '../widgets/SequencingIntensityChartWidget';
import { VariantSelector } from '../data/VariantSelector';
import { useExploreUrl } from '../helpers/explore-url';
import { getCurrentLapisDataVersionDate } from '../data/api-lapis';
import dayjs from 'dayjs';

interface Props {
  onVariantSelect: (selection: VariantSelector) => void;
  selection: VariantSelector | undefined;
  wholeDateCountSampleDataset: DateCountSampleDataset;
  caseCountDataset: CaseCountDataset;
}

const Footer = styled.footer`
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid darkgray;
  font-size: small;
`;

export const ExplorePage = ({
  onVariantSelect,
  selection,
  wholeDateCountSampleDataset,
  caseCountDataset,
}: Props) => {
  const exploreUrl = useExploreUrl();
  if (!exploreUrl) {
    return null;
  }
  return (
    <>
      <div className='mt-4'>
        <VariantSearch onVariantSelect={onVariantSelect} />
      </div>
      <KnownVariantsList
        onVariantSelect={onVariantSelect}
        wholeDateCountSampleDataset={wholeDateCountSampleDataset}
        variantSelector={selection}
      />
      <SequencingIntensityChartWidget.ShareableComponent
        title='Sequencing intensity'
        sequencingCounts={wholeDateCountSampleDataset}
        caseCounts={caseCountDataset}
        height={300}
        widgetLayout={NamedSection}
        toolbarChildren={<ShowMoreButton to={exploreUrl.getDeepExplorePageUrl('/sequencing-coverage')} />}
      />
      <Footer>
        <div>The sequence data was updated on: {dayjs(getCurrentLapisDataVersionDate()).toISOString()}</div>
        <div>
          Data obtained from GISAID that is used in this Web Application remain subject to GISAID’s{' '}
          <ExternalLink url='http://gisaid.org/daa'>Terms and Conditions</ExternalLink>.
        </div>
        <VercelSponsorshipLogo />
      </Footer>
    </>
  );
};
