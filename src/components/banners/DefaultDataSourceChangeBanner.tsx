import { Link } from 'react-router';
import React from 'react';

export const DefaultDataSourceChangeBanner = () => {
  return (
    <div className='w-full bg-blue-50 shadow-lg rounded-xl p-4 dark:bg-gray-800 '>
      As of 23 December 2025, CoV-Spectrum.org is showing only open SARS-CoV-2 sequencing data. GISAID data
      cannot be shown anymore. For details, see{' '}
      <Link to='/news/2025-12-23-removal-of-gisaid-data' className='text-active-secondary'>
        here
      </Link>
      .
    </div>
  );
};
