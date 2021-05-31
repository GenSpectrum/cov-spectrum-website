import { ExternalLink } from './ExternalLink';
import React from 'react';

export const VercelSponsorshipLogo = () => {
  return (
    <div className='my-10'>
      <ExternalLink url='https://vercel.com/?utm_source=cov-spectrum&utm_campaign=oss'>
        <img className='w-32' alt='Powered by Vercel' src='/img/powered-by-vercel.svg' />
      </ExternalLink>
    </div>
  );
};
