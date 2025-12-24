import { ExternalLink } from '../../components/ExternalLink';
import React from 'react';

export function OpenDataSource() {
  return (
    <div className='text-gray-500 text-sm'>
      Enabled by{' '}
      <ExternalLink url='https://nextstrain.org/blog/2021-07-08-ncov-open-announcement'>
        <span className=' border-gray-500 text-gray-800 border-2 px-2 py-0.5 rounded-xl'>open</span>
      </ExternalLink>{' '}
      data
    </div>
  );
}
