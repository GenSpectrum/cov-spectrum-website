import styled from 'styled-components';
import React from 'react';
import { ExternalLink } from '../components/ExternalLink';

const Acknowlegement = ({ title, children }: { title: string; children: any }) => {
  return (
    <div className='w-full bg-blue-100 shadow-lg mb-6 mt-4 rounded-xl p-4 dark:bg-gray-800'>
      <h2 className='font-bold mb-2 mt-0'>{title}</h2>
      <p>{children}</p>
    </div>
  );
};

export const AcknowledgementsPage = () => {
  return (
    <div className='max-w-4xl mx-auto'>
      <h1>Acknowlegements</h1>
      <Acknowlegement title='FOPH and S3C'>
        We gratefully acknowledge the{' '}
        <ExternalLink url='https://www.bag.admin.ch/'>Federal Office of Public Health (FOPH)</ExternalLink>{' '}
        and all members of the{' '}
        <ExternalLink url='https://bsse.ethz.ch/cevo/research/sars-cov-2/swiss-sequencing-consortium---viollier.html'>
          Swiss SARS-CoV-2 Sequencing Consortium (S3C)
        </ExternalLink>{' '}
        for providing sequence and metadata for Switzerland.
      </Acknowlegement>

      <Acknowlegement title='GISAID'>
        We gratefully acknowledge all data contributors, i.e. the Authors and their Originating laboratories
        responsible for obtaining the specimens, and their Submitting laboratories for generating the genetic
        sequence and metadata and sharing via the GISAID Initiative<sup>1</sup> on which this research is
        based.
      </Acknowlegement>
      <p>
        <sup>1</sup> Elbe, S., and Buckland-Merrett, G. (2017) Data, disease and diplomacy: GISAID’s
        innovative contribution to global health. <i>Global Challenges</i>, 1:33-46. DOI:{' '}
        <ExternalLink url='https://dx.doi.org/10.1002/gch2.1018'>10.1002/gch2.1018</ExternalLink>, PMCID:{' '}
        <ExternalLink url='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6607375/'>31565258</ExternalLink>
      </p>
    </div>
  );
};
