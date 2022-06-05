import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HeaderCountrySelect } from './components/HeaderCountrySelect';
import { AccountService } from './services/AccountService';
import { ExternalLink } from './components/ExternalLink';
import { AiOutlineGithub, AiOutlineTwitter } from 'react-icons/ai';
import { FaExchangeAlt, FaFilter } from 'react-icons/fa';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { RiDeleteBack2Fill } from 'react-icons/ri';
import { Button, ButtonVariant } from './helpers/ui';
import { useExploreUrl } from './helpers/explore-url';
import { useHistory } from 'react-router';
import { alternativeSequenceDataSourceUrl, sequenceDataSource } from './helpers/sequence-data-source';
import { HeaderSamplingStrategySelect } from './components/HeaderSamplingStrategySelect';
import { encodeLocationSelectorToSingleString } from './data/LocationSelector';
import { AlmostFullscreenModal } from './components/AlmostFullscreenModal';
import { AdvancedFiltersPanel } from './components/AdvancedFiltersPanel';

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
    redirectLink = `/explore/${encodeLocationSelectorToSingleString(exploreUrl?.location)}`;
  }

  return (
    <a href={redirectLink} className='flex flex-row items-center hover:no-underline md:mb-0.5'>
      <div>
        {letters.map((l: { color: string; text: string }, i) => (
          <span key={i} style={{ color: l.color, fontWeight: 'bold', fontSize: '1.75rem' }}>
            {l.text}
          </span>
        ))}
      </div>
    </a>
  );
};

const BackToExplore = () => {
  const history = useHistory();

  return history.location.pathname.includes('variant') ? (
    <div className='relative inline-block text-left ml-3'>
      <button
        type='button'
        className='border border-black bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center w-full rounded-md  px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500'
        id='options-menu'
        onClick={() => {
          history.push(history.location.pathname.split('variant')[0]);
        }}
      >
        <RiDeleteBack2Fill />
      </button>
    </div>
  ) : (
    <></>
  );
};

const Header = () => {
  const [showAdvancedFilteringModal, setShowAdvancedFilteringModal] = useState(false);

  const loggedIn = AccountService.isLoggedIn();
  let username: string | null | undefined = null;
  if (loggedIn) {
    username = AccountService.getUsername();
  }
  const location = useLocation();

  const getButtonClasses = (path?: string): string =>
    `${
      path && location.pathname === path ? 'text-gray-800' : 'text-gray-400 hover:text-gray-800'
    } px-3 mr-4 rounded-md text-sm font-medium`;

  const getDropdownButtonClasses = (path?: string): string =>
    `${
      path && location.pathname === path ? 'text-gray-800' : 'text-gray-400 hover:text-gray-800'
    } mr-4 rounded-md text-lg font-medium`;

  const FilterDropdown = () => {
    const [infoOpen, setInfoOpen] = useState(false);

    const exploreUrl = useExploreUrl();

    return (
      <div className='flex'>
        {exploreUrl && <div className='flex'></div>}
        {exploreUrl && (
          <div className='lg:hidden'>
            <BackToExplore />
          </div>
        )}
        <div id='info-dropdown' className='relative text-left ml-3 lg:hidden'>
          {' '}
          <div>
            <button
              type='button'
              className='border border-gray-300 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center w-full rounded-md  px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500'
              id='options-menu'
              onClick={() => {
                setInfoOpen(!infoOpen);
              }}
            >
              <div className={infoOpen ? 'fill-current animate-pulse bg-red' : ''}>
                <BsFillInfoCircleFill />
              </div>
            </button>
          </div>
          {infoOpen && (
            <div className='origin-top-right absolute right-0 mt-4 w-48 rounded-md shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5'>
              <div
                className='py-2 px-4 flex flex-col items-start'
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='options-menu'
              >
                <div className='flex w-full justify-between items-center mb-2'>
                  <h2>Links</h2>
                  <Button
                    variant={ButtonVariant.SECONDARY}
                    onClick={() => {
                      setInfoOpen(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
                <button onClick={() => setShowAdvancedFilteringModal(true)}>
                  Advanced <FaFilter className='inline' />
                </button>
                <a className={getDropdownButtonClasses('/stories')} href='/stories'>
                  Stories
                </a>
                <a className={getDropdownButtonClasses('/about')} href='/about'>
                  About
                </a>
                {username === null ? (
                  <a className={getDropdownButtonClasses('/login')} href='/login'>
                    Login
                  </a>
                ) : (
                  <a
                    className={getDropdownButtonClasses()}
                    href='/login?left'
                    onClick={() => {
                      AccountService.logout();
                    }}
                  >
                    Logout {username}
                  </a>
                )}
                <a
                  className={getDropdownButtonClasses('')}
                  href='https://twitter.com/genSpectrum'
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  Twitter
                </a>
                <a
                  className={getDropdownButtonClasses('')}
                  href='https://github.com/cevo-public/cov-spectrum-website'
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  Github
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
      <nav className='flex h-full content-center shadow-md z-50 bg-white '>
        <div className='w-full mx-auto px-2 md:px-0 flex content-center'>
          <div className='md:mx-4 w-full justify-between'>
            <div className='w-full h-full flex justify-center md:justify-between items-center'>
              <div id='logo-and-search' className='flex h-full md:flex-row flex-column justify-center'>
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
                <div className='flex items-center z-20 mt-2 md:mt-0'>
                  <HeaderCountrySelect />
                  <HeaderSamplingStrategySelect />
                  <Button
                    variant={ButtonVariant.SECONDARY}
                    onClick={() => setShowAdvancedFilteringModal(true)}
                    className='hidden lg:block'
                  >
                    Advanced <FaFilter className='inline' />
                  </Button>
                  <FilterDropdown />
                </div>
              </div>
              <div id='right-nav-buttons' className='items-center justify-center hidden lg:block'>
                <div className='ml-1 flex items-center'>
                  <a className={getButtonClasses('/stories')} href='/stories'>
                    Stories
                  </a>
                  <a className={getButtonClasses('/about')} href='/about'>
                    About
                  </a>
                  {username === null ? (
                    <a className={getButtonClasses('/login')} href='/login'>
                      Login
                    </a>
                  ) : (
                    <a
                      className={getButtonClasses()}
                      href='/login?left'
                      onClick={() => {
                        AccountService.logout();
                      }}
                    >
                      Logout {username}
                    </a>
                  )}
                  <ExternalLink url='https://twitter.com/covSpectrum'>
                    <AiOutlineTwitter
                      className='hidden md:block fill-current rounded-xl filter shadow-xl cursor-pointer ml-1 lg:ml-8 hover:opacity-70'
                      size={'1.5em'}
                      style={{ color: '#1d9bf0' }}
                    />
                  </ExternalLink>
                  <ExternalLink url='https://github.com/cevo-public/cov-spectrum-website'>
                    <AiOutlineGithub
                      className='hidden md:block fill-current hover:text-gray-500 rounded-xl filter shadow-xl cursor-pointer ml-1 lg:ml-8 text-black'
                      size={'1.5em'}
                    />
                  </ExternalLink>
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

export default Header;
