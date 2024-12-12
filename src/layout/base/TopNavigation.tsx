import React, { PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdOutlineOpenInNew } from 'react-icons/md';
import { GitHubButton, MastodonButton, TwitterButton } from './SocialIcons';

export function TopNavigation(props: { hideInternalLinks: boolean | undefined }) {
  return (
    <nav id='right-nav-buttons' className='items-center justify-center '>
      <ul className='ml-1 flex items-center gap-6 xl:gap-8'>
        <li>
          <NavigationLink path={'https://genspectrum.org'}>
            <span className='inline-flex gap-1 items-center'>
              GenSpectrum
              <MdOutlineOpenInNew />
            </span>
          </NavigationLink>
        </li>
        {!props.hideInternalLinks && (
          <>
            <li>
              <NavigationLink path={'/collections'}>Collections</NavigationLink>
            </li>
            <li>
              <NavigationLink path={'/stories'}>Stories</NavigationLink>
            </li>
            <li>
              <NavigationLink path={'/about'}>About</NavigationLink>
            </li>
          </>
        )}
        <li>
          <MastodonButton />
        </li>
        <li>
          <TwitterButton />
        </li>
        <li>
          <GitHubButton />
        </li>
      </ul>
    </nav>
  );
}

const NavigationLink = ({ path, children }: PropsWithChildren<{ path: string }>) => {
  const location = useLocation();

  const highlight = location.pathname === path ? 'text-gray-800' : 'text-gray-400 hover:text-gray-800';

  return (
    <Link className={`text-sm font-medium ${highlight}`} to={path}>
      {children}
    </Link>
  );
};
