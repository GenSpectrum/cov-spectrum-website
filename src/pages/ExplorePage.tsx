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
import { isRegion, SamplingStrategy } from '../services/api';
import { Country } from '../services/api-types';
import { SequencingIntensityPlotWidget } from '../widgets/SequencingIntensityPlot';

interface Props {
  country: Country;
  samplingStrategy: SamplingStrategy;
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
  onVariantSelect,
  selection,
  wholeSampleSetState,
  sequencingIntensityEntrySet,
}: Props) => {
  return (
    <>
      <SequencingIntensityPlotWidget.ShareableComponent
        title='Sequencing Intensity'
        sequencingIntensityEntrySet={sequencingIntensityEntrySet}
        height={300}
        widgetLayout={NamedSection}
      />
      <NamedSection title='Known variants'>
        <KnownVariantsList
          country={country}
          samplingStrategy={samplingStrategy}
          onVariantSelect={onVariantSelect}
          selection={selection}
          wholeSampleSetState={wholeSampleSetState}
        />
      </NamedSection>
      <NamedSection title='Search by mutations'>
        <MutationLookup onVariantSelect={onVariantSelect} />
      </NamedSection>
      {!isRegion(country) && (
        <NamedSection title='Interesting mutations'>
          <NewVariantTable
            country={country}
            onVariantSelect={variant => onVariantSelect({ variant, matchPercentage: 1 })}
          />
        </NamedSection>
      )}
      <Footer>
        Data obtained from GISAID that is used in this Web Application remain subject to GISAID’s{' '}
        <ExternalLink url='http://gisaid.org/daa'>Terms and Conditions</ExternalLink>.
      </Footer>
    </>
  );
};
