import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { HeaderCountrySelect } from './components/HeaderCountrySelect';
import { HeaderSamplingStrategySelect } from './components/HeaderSamplingStrategySelect';
import { AccountService } from './services/AccountService';
import { HeaderDateRangeSelect } from './components/HeaderDateRangeSelect';
import { ExternalLink } from './components/ExternalLink';
import { AiOutlineGithub } from 'react-icons/ai';
import styled, { createGlobalStyle } from 'styled-components';
import { headerHeightPx } from './helpers/app-layout';

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
  const getButtonClasses = (path: string): string =>
    (`${
      location.pathname === path ? 'text-gray-800' : 'text-gray-400 hover:text-gray-800'
    } px-3 py-2 rounded-md text-sm font-medium`);

  return (
    <>
      <nav className='flex content-center shadow-md z-30 h-40 md:h-20'>
        <div className='w-full mx-auto px-4 flex content-center'>
          <div className='w-full flex items-center'>
            <div className='w-full flex justify-between items-center h-20'>
              <div id='logo-and-search' className='flex md:flex-row flex-column'>
                <div id='logo-and-gsid' className='flex flex-column items-center justify-center'>
                  <div>{Logo}</div>
                  <div className='text-xs flex flex-row justify-between space-x-1'>
                    <div className='self-end text-gray-500 text-sm'>Enabled by data from </div>{' '}
                    <ExternalLink url='https://gisaid.org/'>
                      <img src='/img/gisaid.png' alt='GISAID' style={{ height: '20px' }} />{' '}
                    </ExternalLink>
                  </div>
                </div>
                <div className='flex items-center z-20 ml-8'>
                  <HeaderCountrySelect />
                  <div id='date-range-wrapper' className='hidden sm:block'>
                    <HeaderDateRangeSelect />
                  </div>
                  <div className='hidden md:block'>
                    <HeaderSamplingStrategySelect />
                  </div>
                </div>
              </div>
              <div id='right-nav-buttons' className='hidden md:block items-center justify-center'>
                <div className='ml-4 flex items-center space-x-4'>
                  <a className={getButtonClasses('/acknowledgements')} href='/acknowledgements'>
                    Acknowledgements
                  </a>
                  <a className={getButtonClasses('/about')} href='/about'>
                    About
                  </a>
                  <a className={getButtonClasses('/login')} href='/login'>
                    Login
                  </a>
                  <div
                    onClick={() =>
                      window.open('https://github.com/cevo-public/cov-spectrum-website', '_blank')
                    }
                  >
                    <AiOutlineGithub
                      className='fill-current hover:text-gray-500 rounded-xl filter shadow-xl cursor-pointer'
                      size={'1.5em'}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='block'>
              <div className='ml-4 flex items-center md:ml-6'></div>
            </div>
            <div className='-mr-2 flex md:hidden'>
              <button className='text-gray-800 dark:text-white hover:text-gray-300 inline-flex items-center justify-center p-2 rounded-md focus:outline-none'>
                <svg
                  width={20}
                  height={20}
                  fill='currentColor'
                  className='h-8 w-8'
                  viewBox='0 0 1792 1792'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M1664 1344v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45z'></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className='md:hidden z-50'>
        <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
          <a
            className='text-gray-300 hover:text-gray-800 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium'
            href='/#'
          >
            Home
          </a>
          <a
            className='text-gray-800 dark:text-white block px-3 py-2 rounded-md text-base font-medium'
            href='/#'
          >
            Gallery
          </a>
          <a
            className='text-gray-300 hover:text-gray-800 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium'
            href='/#'
          >
            Content
          </a>
          <a
            className='text-gray-300 hover:text-gray-800 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium'
            href='/#'
          >
            Contact
          </a>
        </div>
      </div>
    </>
  );
};

export default Header;
