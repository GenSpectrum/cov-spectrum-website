import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeaderCountrySelect } from './components/HeaderCountrySelect';
import { ExternalLink } from './components/ExternalLink';
import { AiOutlineGithub, AiOutlineTwitter, AiOutlineMenu } from 'react-icons/ai';
import { FaExchangeAlt, FaFilter, FaMastodon } from 'react-icons/fa';
import { Button, ButtonVariant } from './helpers/ui';
import { useExploreUrl } from './helpers/explore-url';
import { alternativeSequenceDataSourceUrl, sequenceDataSource } from './helpers/sequence-data-source';
import { HeaderSamplingStrategySelect } from './components/HeaderSamplingStrategySelect';
import { encodeLocationSelectorToSingleString } from './data/LocationSelector';
import { AlmostFullscreenModal } from './components/AlmostFullscreenModal';
import { AdvancedFiltersPanel } from './components/AdvancedFiltersPanel';
import { defaultDateRange, defaultSamplingStrategy } from './data/default-selectors';

const letters = [
  { color: 'darkgray', text: 'cov' },
  { color: '#0D4A70', text: 'S' },
  { color: '#245C70', text: 'P' },
  { color: '#3A6E6F', text: 'E' },
  { color: '#67916E', text: 'C' },
  { color: '#AC8D3A', text: 'T' },
  { color: '#CF8B20', text: 'R' },
  { color: '#E08A13', text: 'U' },
  { color: '#F18805', text: 'M' },
];

const Logo = () => {
  const locationState = useLocation();
  const exploreUrl = useExploreUrl();
  let redirectLink = '/';
  if (locationState.pathname.startsWith('/explore/') && exploreUrl?.location) {
    redirectLink = `/explore/${encodeLocationSelectorToSingleString(
      exploreUrl?.location
    )}/${defaultSamplingStrategy}/${defaultDateRange}`;
  }

  return (
    <Link to={redirectLink} className='flex flex-row items-center hover:no-underline md:mb-0.5'>
      <div>
        {letters.map((l: { color: string; text: string }, i) => (
          <span key={i} style={{ color: l.color, fontWeight: 'bold', fontSize: '1.75rem' }}>
            {l.text}
          </span>
        ))}
      </div>
    </Link>
  );
};

const Header = () => {
  const [showAdvancedFilteringModal, setShowAdvancedFilteringModal] = useState(false);
  const [showOffCanvas, setShowOffCanvas] = useState(false);

  const location = useLocation();
  const exploreUrl = useExploreUrl();

  const getButtonClasses = (path?: string): string =>
    `${
      path && location.pathname === path ? 'text-gray-800' : 'text-gray-400 hover:text-gray-800'
    } px-3 mr-4 rounded-md text-sm font-medium`;

  const buttonToAlternativeSequenceDataSource = alternativeSequenceDataSourceUrl ? (
    <ExternalLink
      url={`${alternativeSequenceDataSourceUrl}${window.location.pathname}${window.location.search}`}
      label={sequenceDataSource === 'open' ? 'Use GISAID data' : 'Use open data'}
      newWindow={false}
    >
      <FaExchangeAlt className='inline ml-4' />
    </ExternalLink>
  ) : (
    <></>
  );

  return (
    <>
      <OffcanvasNav
        show={showOffCanvas}
        onClose={() => setShowOffCanvas(false)}
        setShowAdvancedFilteringModal={setShowAdvancedFilteringModal}
      />
      <nav className='flex h-full content-center shadow-md z-50 bg-white pb-2'>
        <div className='w-full mx-auto px-2 md:px-0 flex content-center'>
          <div className='md:mx-4 w-full justify-between'>
            <div className='w-full h-full flex justify-center md:justify-between items-center'>
              <div id='logo-and-search' className='flex h-full md:flex-row flex-column justify-center'>
                {/* Logo */}
                <div id='logo-and-gsid' className='flex flex-column items-center justify-center md:pr-4'>
                  <div>
                    <Logo />
                  </div>
                  {sequenceDataSource === 'gisaid' ? (
                    <>
                      <div className='text-xs flex flex-row justify-between space-x-1'>
                        <div className='self-end text-gray-500 text-sm'>Enabled by data from </div>{' '}
                        <ExternalLink url='https://gisaid.org/'>
                          <img src='/img/gisaid.png' alt='GISAID' style={{ height: '20px' }} />{' '}
                        </ExternalLink>
                        {buttonToAlternativeSequenceDataSource}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='text-gray-500 text-sm'>
                        Enabled by{' '}
                        <ExternalLink url='https://nextstrain.org/blog/2021-07-08-ncov-open-announcement'>
                          <span className=' border-gray-500 text-gray-800 border-2 px-2 py-0.5 rounded-xl'>
                            open
                          </span>
                        </ExternalLink>{' '}
                        data
                        {buttonToAlternativeSequenceDataSource}
                      </div>
                    </>
                  )}
                </div>
                {/* Mobile off-canvas menu opener button */}
                <button
                  onClick={() => setShowOffCanvas(true)}
                  className='outline-none border-solid border border-gray-400 p-1 rounded-lg absolute lg:hidden'
                  style={{ top: 7, right: 7 }}
                >
                  <AiOutlineMenu size='1.5em' />
                </button>
                {/* Filters and more */}
                <div className='flex flex-wrap items-center justify-center gap-y-2 z-20 mt-2 md:mt-0'>
                  <div className='flex-grow'>
                    <HeaderCountrySelect />
                  </div>
                  <div className='flex-grow'>
                    <HeaderSamplingStrategySelect />
                  </div>
                  {exploreUrl && (
                    <Button
                      variant={ButtonVariant.SECONDARY}
                      onClick={() => setShowAdvancedFilteringModal(true)}
                      className='hidden lg:block'
                    >
                      Advanced <FaFilter className='inline' />
                    </Button>
                  )}
                </div>
              </div>
              {/* Right part */}
              <div id='right-nav-buttons' className='items-center justify-center hidden lg:block'>
                <div className='ml-1 flex items-center'>
                  <Link className={getButtonClasses('/chat')} to={'/chat'}>
                    Chat
                  </Link>
                  <Link className={getButtonClasses('/collections')} to={'/collections'}>
                    Collections
                  </Link>
                  <Link className={getButtonClasses('/stories')} to={'/stories'}>
                    Stories
                  </Link>
                  <Link className={getButtonClasses('/about')} to={'/about'}>
                    About
                  </Link>
                  {MastodonButton}
                  {TwitterButton}
                  {GitHubButton}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Advanced filtering modal */}
      <AlmostFullscreenModal
        header='Advanced filters'
        show={showAdvancedFilteringModal}
        handleClose={() => setShowAdvancedFilteringModal(false)}
      >
        <AdvancedFiltersPanel onClose={() => setShowAdvancedFilteringModal(false)} />
      </AlmostFullscreenModal>
    </>
  );
};

type OffcanvasNavProps = {
  show: boolean;
  onClose: () => void;
  setShowAdvancedFilteringModal: (value: boolean) => void;
};

const OffcanvasNav = ({ show, onClose, setShowAdvancedFilteringModal }: OffcanvasNavProps) => {
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
      <div
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
          <OffcanvasNavItem text='Chat' url='/chat' onClick={onClose} />
          <OffcanvasNavItem text='Collections' url='/collections' onClick={onClose} />
          <OffcanvasNavItem text='Stories' url='/stories' onClick={onClose} />
          <OffcanvasNavItem text='About' url='/about' onClick={onClose} />
        </div>
        <div className='flex justify-center mt-4'>
          <div className='mx-6'>{MastodonButton}</div>
          <div className='mx-6'>{TwitterButton}</div>
          <div className='mx-6'>{GitHubButton}</div>
        </div>
      </div>
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

const GitHubButton = (
  <ExternalLink url='https://github.com/cevo-public/cov-spectrum-website'>
    <AiOutlineGithub
      className='fill-current hover:text-gray-500 rounded-xl filter shadow-xl cursor-pointer ml-1 lg:ml-8 text-black'
      size={'1.5em'}
    />
  </ExternalLink>
);

const TwitterButton = (
  <ExternalLink url='https://twitter.com/GenSpectrum'>
    <AiOutlineTwitter
      className='fill-current rounded-xl filter shadow-xl cursor-pointer ml-1 lg:ml-8 hover:opacity-70'
      size={'1.5em'}
      style={{ color: '#1d9bf0' }}
    />
  </ExternalLink>
);

const MastodonButton = (
  <ExternalLink url='https://mstdn.science/@chaoranchen'>
    <FaMastodon
      className='fill-current rounded-xl filter shadow-xl cursor-pointer ml-1 lg:ml-8 hover:opacity-70'
      size={'1.5em'}
      style={{ color: '#5a48dd' }}
    />
  </ExternalLink>
);

export default Header;
