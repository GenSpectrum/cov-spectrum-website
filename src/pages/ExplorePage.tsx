import React from 'react';
import { AsyncState } from 'react-async';
import styled from 'styled-components';
import { ExternalLink } from '../components/ExternalLink';
import { KnownVariantsList } from '../components/KnownVariantsList/KnownVariantsList';
import { MutationLookup } from '../components/MutationLookup';
import { NamedSection } from '../components/NamedSection';
import { NewVariantTable } from '../components/NewVariantTable';
import { VariantSelector } from '../helpers/sample-selector';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { SequencingIntensityEntrySetWithSelector } from '../helpers/sequencing-intensity-entry-set';
import { DateRange, isRegion, SamplingStrategy } from '../services/api';
import { Country } from '../services/api-types';
import { SequencingIntensityPlotWidget } from '../widgets/SequencingIntensityPlot';
import { AccountService } from '../services/AccountService';
import { VercelSponsorshipLogo } from '../components/VercelSponsorshipLogo';
import { createLocation } from 'history';
import { generatePath } from 'react-router';
import { ShowMoreButton } from '../helpers/ui';
import { VariantSearch } from '../components/VariantSearch/VariantSearch';

interface Props {
  country: Country;
  samplingStrategy: SamplingStrategy;
  dateRange: DateRange;
  onVariantSelect: (selection: VariantSelector) => void;
  selection: VariantSelector | undefined;
  wholeSampleSetState: AsyncState<SampleSetWithSelector>;
  sequencingIntensityEntrySet: SequencingIntensityEntrySetWithSelector;
}

const Footer = styled.footer`
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid darkgray;
  font-size: small;
`;

export const ExplorePage = ({
  country,
  samplingStrategy,
  dateRange,
  onVariantSelect,
  selection,
  wholeSampleSetState,
  sequencingIntensityEntrySet,
}: Props) => {
  const toSequencingCoverage = createLocation(
    generatePath(`/explore/${country}/${samplingStrategy}/${dateRange}/sequencing-coverage`)
  );
  return (
    <>
      <div className='mt-4'>
        <VariantSearch onVariantSelect={onVariantSelect} />
      </div>
      <NamedSection title='Known variants'>
        <KnownVariantsList
          country={country}
          samplingStrategy={samplingStrategy}
          onVariantSelect={onVariantSelect}
          selection={selection}
          wholeSampleSetState={wholeSampleSetState}
        />
      </NamedSection>
      <SequencingIntensityPlotWidget.ShareableComponent
        title='Sequencing intensity'
        sequencingIntensityEntrySet={sequencingIntensityEntrySet}
        height={300}
        widgetLayout={NamedSection}
        toolbarChildren={<ShowMoreButton to={toSequencingCoverage} />}
      />
      {AccountService.isLoggedIn() && (
        <NamedSection title='Search by mutations'>
          <MutationLookup onVariantSelect={onVariantSelect} />
        </NamedSection>
      )}
      {/* The auto-detection of interesting mutations remains a very important part of the overall concept of
          CoV-Spectrum. The current algorithm is however not good enough. Further, the program is not automated
          and it has been a while that it was executed so that the data are quite outdated. Thus, we will show it
          only to logged-in users for now.
       */}
      {AccountService.isLoggedIn() && !isRegion(country) && (
        <NamedSection title='Interesting mutations'>
          <NewVariantTable
            country={country}
            onVariantSelect={variant => onVariantSelect({ variant, matchPercentage: 1 })}
          />
        </NamedSection>
      )}
      <Footer>
        <div>
          Data obtained from GISAID that is used in this Web Application remain subject to GISAID’s{' '}
          <ExternalLink url='http://gisaid.org/daa'>Terms and Conditions</ExternalLink>.
        </div>
        <VercelSponsorshipLogo />
      </Footer>
    </>
  );
};
