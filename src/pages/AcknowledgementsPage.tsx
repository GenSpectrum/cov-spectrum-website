import styled from 'styled-components';
import React from 'react';
import { ExternalLink } from '../components/ExternalLink';

const Wrapper = styled.div`
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const SubHeader = styled.h2`
  font-size: 1.4rem;
`;

export const AcknowledgementsPage = () => {
  return (
    <Wrapper>
      <h1>Acknowlegements</h1>

      <SubHeader>
        Federal Office of Public Health (FOPH) of Switzerland and the Swiss SARS-CoV-2 Sequencing Consortium
        (S3C)
      </SubHeader>
      <p>
        We gratefully acknowledge the{' '}
        <ExternalLink url='https://www.bag.admin.ch/'>Federal Office of Public Health (FOPH)</ExternalLink>{' '}
        and all members of the{' '}
        <ExternalLink url='https://bsse.ethz.ch/cevo/research/sars-cov-2/swiss-sequencing-consortium---viollier.html'>
          Swiss SARS-CoV-2 Sequencing Consortium (S3C)
        </ExternalLink>{' '}
        for providing sequence and metadata for Switzerland.
      </p>

      <SubHeader>GISAID</SubHeader>
      <p>
        We gratefully acknowledge all data contributors, i.e. the Authors and their Originating laboratories
        responsible for obtaining the specimens, and their Submitting laboratories for generating the genetic
        sequence and metadata and sharing via the GISAID Initiative<sup>1</sup> on which this research is
        based.
      </p>
      <p>
        <sup>1</sup> Elbe, S., and Buckland-Merrett, G. (2017) Data, disease and diplomacy: GISAID’s
        innovative contribution to global health. <i>Global Challenges</i>, 1:33-46. DOI:{' '}
        <ExternalLink url='https://dx.doi.org/10.1002/gch2.1018'>10.1002/gch2.1018</ExternalLink>, PMCID:{' '}
        <ExternalLink url='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6607375/'>31565258</ExternalLink>
      </p>
    </Wrapper>
  );
};
