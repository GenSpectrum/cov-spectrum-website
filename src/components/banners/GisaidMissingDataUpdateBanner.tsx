import { Link } from 'react-router';
import React from 'react';
import { MdOutlineOpenInNew } from 'react-icons/md';

export const GisaidMissingDataUpdateBanner = () => {
  return (
    <div className='w-full bg-yellow-100 shadow-lg rounded-xl p-4 dark:bg-gray-800 mx-2 my-4'>
      <h2>Data feed interruption</h2>
      <p>
        Data on this dashboard has not been updated since <span className='font-bold'>12 October 2025</span>{' '}
        due to an interruption in the data feed. We have contacted the data provider GISAID regarding this
        issue and hope for a resolution soon. In the meantime, you can check out the{' '}
        <Link to='https://open.cov-spectrum.org' className='text-active-secondary'>
          Open instance of CoV-Spectrum
        </Link>{' '}
        or the new{' '}
        <Link to={'https://genspectrum.org/'} className={'text-active-secondary'}>
          <span className='inline-flex gap-1 items-center'>
            GenSpectrum dashboard
            <MdOutlineOpenInNew />
          </span>
        </Link>{' '}
        for more recent data from INSDC.
      </p>
    </div>
  );
};
