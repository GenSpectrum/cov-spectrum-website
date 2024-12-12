import { ExternalLink } from '../../components/ExternalLink';
import React from 'react';
import { alternativeSequenceDataSourceUrl, sequenceDataSource } from '../../helpers/sequence-data-source';
import { FaExchangeAlt } from 'react-icons/fa';

export function GisaidDataSource() {
  return (
    <div className='text-xs flex flex-row justify-between space-x-1'>
      <div className='self-end text-gray-500 text-sm'>Enabled by data from</div>{' '}
      <ExternalLink url='https://gisaid.org/'>
        <img src='/img/gisaid.png' alt='GISAID' style={{ height: '20px' }} />{' '}
      </ExternalLink>
      <SwitchToAlternativeSequenceDataSource />
    </div>
  );
}

export function OpenDataSource() {
  return (
    <div className='text-gray-500 text-sm'>
      Enabled by{' '}
      <ExternalLink url='https://nextstrain.org/blog/2021-07-08-ncov-open-announcement'>
        <span className=' border-gray-500 text-gray-800 border-2 px-2 py-0.5 rounded-xl'>open</span>
      </ExternalLink>{' '}
      data
      <SwitchToAlternativeSequenceDataSource />
    </div>
  );
}

function SwitchToAlternativeSequenceDataSource() {
  if (!alternativeSequenceDataSourceUrl) {
    return null;
  }

  return (
    <ExternalLink
      url={`${alternativeSequenceDataSourceUrl}${window.location.pathname}${window.location.search}`}
      label={sequenceDataSource === 'open' ? 'Use GISAID data' : 'Use open data'}
      newWindow={false}
    >
      <FaExchangeAlt className='inline ml-4' />
    </ExternalLink>
  );
}
