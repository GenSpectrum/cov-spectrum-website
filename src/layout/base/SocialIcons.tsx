import { ExternalLink } from '../../components/ExternalLink';
import { AiOutlineGithub, AiOutlineTwitter } from 'react-icons/ai';
import React from 'react';
import { FaMastodon } from 'react-icons/fa';

export const GitHubButton = () => {
  return (
    <ExternalLink url='https://github.com/cevo-public/cov-spectrum-website'>
      <AiOutlineGithub
        className='fill-current hover:text-gray-500 rounded-xl filter shadow-xl cursor-pointer text-black'
        size={'1.5em'}
      />
    </ExternalLink>
  );
};
export const TwitterButton = () => {
  return (
    <ExternalLink url='https://twitter.com/GenSpectrum'>
      <AiOutlineTwitter
        className='fill-current rounded-xl filter shadow-xl cursor-pointer hover:opacity-70'
        size={'1.5em'}
        style={{ color: '#1d9bf0' }}
      />
    </ExternalLink>
  );
};
export const MastodonButton = () => {
  return (
    <ExternalLink url='https://mstdn.science/@chaoranchen'>
      <FaMastodon
        className='fill-current rounded-xl filter shadow-xl cursor-pointer hover:opacity-70'
        size={'1.5em'}
        style={{ color: '#5a48dd' }}
      />
    </ExternalLink>
  );
};
