import React from 'react';
import { useLocation } from 'react-router-dom';
import { HeaderCountrySelect } from './components/HeaderCountrySelect';
import { HeaderSamplingStrategySelect } from './components/HeaderSamplingStrategySelect';
import { AccountService } from './services/AccountService';
import { HeaderDateRangeSelect } from './components/HeaderDateRangeSelect';
import { ExternalLink } from './components/ExternalLink';
import { AiOutlineGithub } from 'react-icons/ai';

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

const Logo = (
  <a href='/' className='flex flex-row items-center hover:no-underline md:mb-0.5'>
    <div>
      {letters.map((l: { color: string; text: string }) => (
        <span style={{ color: l.color, fontWeight: 'bold', fontSize: '1.75rem' }}>{l.text}</span>
      ))}
    </div>
  </a>
);

const Header = () => {
  const loggedIn = AccountService.isLoggedIn();
  let username = null;
  if (loggedIn) {
    username = AccountService.getUsername();
  }

  const location = useLocation();
  const getButtonClasses = (path?: string): string =>
    `${
      path && location.pathname === path ? 'text-gray-800' : 'text-gray-400 hover:text-gray-800'
    } px-3 mr-4 rounded-md text-sm font-medium`;

  return (
    <>
      <nav className='flex h-full content-center shadow-md z-50 bg-white '>
        <div className='w-full mx-auto px-2 md:px-0 flex content-center'>
          <div className='md:mx-4 w-full justify-between'>
            <div className='w-full h-full flex justify-center md:justify-between items-center'>
              <div id='logo-and-search' className='flex h-full md:flex-row flex-column justify-center'>
                <div id='logo-and-gsid' className='flex flex-column items-center justify-center md:pr-4'>
                  <div>{Logo}</div>
                  <div className='text-xs flex flex-row justify-between space-x-1'>
                    <div className='self-end text-gray-500 text-sm'>Enabled by data from </div>{' '}
                    <ExternalLink url='https://gisaid.org/'>
                      <img src='/img/gisaid.png' alt='GISAID' style={{ height: '20px' }} />{' '}
                    </ExternalLink>
                  </div>
                </div>
                <div className='flex items-center z-20 mt-2 md:mt-0'>
                  <HeaderCountrySelect />
                  <div id='date-range-wrapper'>
                    <HeaderDateRangeSelect />
                  </div>
                  <div className='hidden xl:block'>
                    <HeaderSamplingStrategySelect />
                  </div>
                </div>
              </div>
              <div id='right-nav-buttons' className='hidden md:block items-center justify-center'>
                <div className='ml-1 flex items-center'>
                  <a
                    className={`${getButtonClasses('/acknowledgements')} hidden lg:block`}
                    href='/acknowledgements'
                  >
                    Acknowledgements
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
                  <div
                    onClick={() =>
                      window.open('https://github.com/cevo-public/cov-spectrum-website', '_blank')
                    }
                  >
                    <AiOutlineGithub
                      className='hidden md:block fill-current hover:text-gray-500 rounded-xl filter shadow-xl cursor-pointer ml-1 lg:ml-8'
                      size={'1.5em'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
