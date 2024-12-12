import { useExploreUrl } from '../../helpers/explore-url';
import { Link } from 'react-router-dom';
import { MdOutlineOpenInNew } from 'react-icons/md';
import { GitHubButton, MastodonButton, TwitterButton } from './SocialIcons';
import React from 'react';

type OffcanvasNavProps = {
  show: boolean;
  onClose: () => void;
  setShowAdvancedFilteringModal: (value: boolean) => void;
};

export const DrawerNavigation = ({ show, onClose, setShowAdvancedFilteringModal }: OffcanvasNavProps) => {
  const exploreUrl = useExploreUrl();
  return (
    <>
      {/* Gray and transparent layer */}
      {show && (
        <div
          className={`h-full fixed bg-black/60 w-screen`}
          style={{ zIndex: 1000, top: 0, left: 0 }}
          onClick={() => onClose()}
        ></div>
      )}
      {/* The actual menu */}
      <nav
        className={`h-full bg-white/100 fixed`}
        style={{ zIndex: 1001, top: 0, left: !show ? '-100vw' : 0, width: '80vw', transition: 'left 0.6s' }}
        onClick={e => e.stopPropagation()}
      >
        <div className='font-bold m-4'>
          <Link to='/'>CoV-Spectrum</Link>
        </div>
        <div className='divide-y-2 divide-gray-300 divide-solid border-t-2 border-b-2 border-gray-300 border-solid'>
          {exploreUrl && (
            <OffcanvasNavItem
              text='Advanced filters'
              onClick={() => {
                onClose();
                setShowAdvancedFilteringModal(true);
              }}
            />
          )}
          <div className='flex flex-row gap-1 items-center'>
            <OffcanvasNavItem text='GenSpectrum' url='https://genspectrum.org' onClick={onClose} />
            <MdOutlineOpenInNew />
          </div>
          <OffcanvasNavItem text='Collections' url='/collections' onClick={onClose} />
          <OffcanvasNavItem text='Stories' url='/stories' onClick={onClose} />
          <OffcanvasNavItem text='About' url='/about' onClick={onClose} />
        </div>
        <div className='flex justify-center mt-4 gap-6'>
          <MastodonButton />
          <TwitterButton />
          <GitHubButton />
        </div>
      </nav>
    </>
  );
};

type OffcanvasNavItemProps = {
  text: string;
  url?: string;
  onClick?: () => void;
};

const OffcanvasNavItem = ({ text, url, onClick }: OffcanvasNavItemProps) => {
  let inner = (
    <div className='h-12 flex items-center' onClick={onClick}>
      <div className='pl-4'>{text}</div>
    </div>
  );
  if (url) {
    inner = <Link to={url}>{inner}</Link>;
  }

  return <div>{inner}</div>;
};
