import { ExternalLink } from './ExternalLink';
import React from 'react';

export const VercelSponsorshipLogo = () => {
  return (
    <ExternalLink url='https://vercel.com/?utm_source=cov-spectrum&utm_campaign=oss'>
      <img className='w-36 mx-auto my-4' alt='Powered by Vercel' src='/img/powered-by-vercel.svg' />
    </ExternalLink>
  );
};
