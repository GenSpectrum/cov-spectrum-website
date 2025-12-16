import { sequenceDataSource } from '../helpers/sequence-data-source';
import { Link } from 'react-router';
import React from 'react';

export const GisaidRemovalBanner = () => {
  if (sequenceDataSource === 'gisaid') {
    return (
      <div className='w-full bg-red-100 shadow-lg mt-4 rounded-xl p-4 dark:bg-gray-800 mx-2 mr-4'>
        <h2>Update (16 December 2025):</h2>
        <p>
          GISAID has informed us of their decision to permanently terminate the data feed for CoV-Spectrum and
          has requested the removal of this dashboard. While we regret this decision, we respect the request
          and will{' '}
          <span className='font-bold'>
            shut down this GISAID-powered instance of CoV-Spectrum at the latest on 15 January 2026
          </span>
          . If you relied on data from this website for your analyses, please consider taking screenshots of
          the relevant pages. We regret this outcome. Nevertheless, we would like to thank GISAID and all data
          contributors for providing data over the past five years.
        </p>
        <p>
          <span className='font-bold'>Note:</span> The{' '}
          <Link to='https://open.cov-spectrum.org' className='text-active-secondary'>
            Open CoV-Spectrum instance
          </Link>
          , powered by data submitted to INSDC, will continue to operate and will become the default instance,
          available on cov-spectrum.org.
        </p>
      </div>
    );
  }
  return <></>;
};
