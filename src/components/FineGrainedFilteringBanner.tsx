import { sequenceDataSource } from '../helpers/sequence-data-source';
import { Link } from 'react-router';
import React from 'react';

export const FineGrainedFilteringBanner = () => {
  if (sequenceDataSource === 'gisaid') {
    return (
      <div className='w-full bg-green-100 shadow-lg mt-4 rounded-xl p-4 dark:bg-gray-800 mx-2 mr-4'>
        <h2>Update (12 November 2025):</h2>
        <p>
          <span className='font-bold'>Background.</span> As a dashboard for in-depth analysis and detection of
          new SARS-CoV-2 variants, CoV-Spectrum supports fine-grained filtering of the data via metadata and
          mutation searches. Such fine-grained filtering provided very valuable and timely public health
          information of new variants during the pandemic. However, with such filtering methods, within the
          &gt;17 million sequences, one can also aim to carefully put many filters to arrive at a page
          displaying properties of a single sequence. By comparing its mutation list to the reference, one can
          in principle reconstruct the original sequence, up to changes introduced by the alignment algorithm.
          This circumvents the "aggregation" which is the intended and GISAID-compliant way CoV-Spectrum
          surfaces data. Importantly, we have no evidence that this was used in any concerning way and did not
          hear concerns from data generators or GISAID. At no moment, it had been possible to download bulk
          sequencing data.
        </p>
        <p>
          <span className='font-bold'>Change.</span> We have taken measures to prevent the very detailed
          queries. In particular, we now only show results if at least 10 sequences are found (at the cost of
          thus disabling the exploration of rare variants).
        </p>
        <p>
          <span className='font-bold'>Note.</span> If users want to explore rare variants, we refer them to
          the{' '}
          <Link to='https://open.cov-spectrum.org' className='text-active-secondary'>
            Open instance of CoV-Spectrum
          </Link>
          .
        </p>
      </div>
    );
  }
  return <></>;
};
