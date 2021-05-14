import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { HeaderCountrySelect } from './components/HeaderCountrySelect';
import { HeaderSamplingStrategySelect } from './components/HeaderSamplingStrategySelect';
import { AccountService } from './services/AccountService';
import { HeaderDateRangeSelect } from './components/HeaderDateRangeSelect';
import { ExternalLink } from './components/ExternalLink';
import { AiOutlineGithub } from 'react-icons/ai';
import styled, { createGlobalStyle } from 'styled-components';
import { headerHeightPx } from './helpers/app-layout';

// HACK There is no way to style Navbar.Collapse without using class names
const navbarCollapseClassName = 'styled-navbar-collapse';
const NavbarCollapseGlobalStyle = createGlobalStyle`
  @media not screen and (min-width: 768px) {
    .${navbarCollapseClassName} {
      position: fixed;
      top: ${headerHeightPx}px;
      left: 0;
      width: 100%;
      max-height: calc(100vh - ${headerHeightPx}px);
      overflow: hidden auto;
      z-index: 30;
      background: var(--light);
      padding: 10px 30px;
      border-bottom: 1px solid #dee2e6;

      form {
        margin: 5px 0;
      }
    }
  }
`;

const LeftNavGroup = styled.div`
  @media (min-width: 768px) {
    margin-left: 1.5rem;
    margin-right: auto;
  }
`;

const BrandGisaidWrapper = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 1550px) {
    height: ${headerHeightPx - 1}px;
    margin-top: calc(-0.5rem - 3px);
    margin-bottom: -0.5rem;
    flex-direction: column;
    align-items: initial;
  }
`;

const GisaidWrapper = styled.div`
  font-size: small;

  @media (max-width: 1550px) {
    margin-top: -7px;
    white-space: nowrap;
  }
`;

const Wrapper = styled.div`
  flex-flow: column;
  height: 100%;
`;

const TopNavbar = styled(Navbar)`
  height: 50%;
`;

const BottomNavbar = styled(Navbar)`
  height: 50%;
`;

const Logo = (
  <div>
    <Navbar.Brand as={Link} to='/'>
      <span style={{ color: 'darkgray', fontWeight: 'bold' }}>cov</span>
      <span style={{ color: '#0D4A70', fontWeight: 'bold' }}>S</span>
      <span style={{ color: '#245C70', fontWeight: 'bold' }}>P</span>
      <span style={{ color: '#3A6E6F', fontWeight: 'bold' }}>E</span>
      <span style={{ color: '#67916E', fontWeight: 'bold' }}>C</span>
      <span style={{ color: '#AC8D3A', fontWeight: 'bold' }}>T</span>
      <span style={{ color: '#CF8B20', fontWeight: 'bold' }}>R</span>
      <span style={{ color: '#E08A13', fontWeight: 'bold' }}>U</span>
      <span style={{ color: '#F18805', fontWeight: 'bold' }}>M</span>
    </Navbar.Brand>
  </div>
);

 const Header = () => {
  const loggedIn = AccountService.isLoggedIn();
  let username = null;
  if (loggedIn) {
    username = AccountService.getUsername();
  }

  return (
    <>
      <div className='shadow'>
        <div id='nav-top'>
          <nav className='bg-blue '>
            <div className='max-w-9xl mx-auto px-8'>
              <div className='flex items-center justify-between h-8'>
                <div className='w-full justify-between flex items-center'>
                  <div id='logo-and-gsid' className='flex flex-row items-center justify-center'>
                    <a className='flex-shrink-0 flex items-center justify-center' href='/'>
                      {Logo}
                    </a>
                    <div className='text-xs flex flex-row'>
                      <div className='self-end mr-1'>Enabled by data from </div>{' '}
                      <ExternalLink url='https://gisaid.org/'>
                        <img src='/img/gisaid.png' alt='GISAID' style={{ height: '20px' }} />{' '}
                      </ExternalLink>
                    </div>
                  </div>
                  <div className='hidden md:block items-center justify-center'>
                    <div className='ml-10 flex items-center space-x-4'>
                      <a
                        className='text-gray-300  hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium'
                        href='/acknoledgements'
                      >
                        Acknowledgements
                      </a>
                      <a
                        className='text-gray-300  hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium'
                        href='/about'
                      >
                        About
                      </a>
                      <a
                        className='text-gray-300  hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium'
                        href='/login'
                      >
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
            <div className='md:hidden'>
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
          </nav>
        </div>
        <div id='navbar-bottom'>
          <nav className='bg-blue '>
            <div className='max-w-9xl mx-auto px-8'>
              <div className='flex items-center justify-between h-12'>
                <div className='w-full flex items-center z-20'>
                  <HeaderCountrySelect />
                  <HeaderDateRangeSelect />
                  <HeaderSamplingStrategySelect />
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>

    // <Wrapper className="bg-white">
    //   <TopNavbar bg='light' expand='md' className='bg-white flex items-center justify-between h-16'>
    //     <div className="w-full justify-between flex items-center">
    //       {Logo}
    //       <div className='text-xs flex flex-row'>
    //         <div className='self-end mr-1'>Enabled by data from </div>
    //         <ExternalLink url='https://gisaid.org/'>
    //           <img src='/img/gisaid.png' alt='GISAID' style={{ height: '20px' }} />
    //         </ExternalLink>
    //       </div>
    //     </div>
    //     <div>
    //       <Navbar.Toggle aria-controls='basic-navbar-nav' />
    //       <Navbar.Collapse>
    //         <Nav>
    //           {loggedIn ? (
    //             <>
    //               <Navbar.Text>Signed in as {username}</Navbar.Text>
    //               <Nav.Link>
    //                 <button
    //                   onClick={() => {
    //                     AccountService.logout();
    //                     window.location.href = '/login?left';
    //                   }}
    //                   style={{
    //                     background: 'none',
    //                     outline: 'none',
    //                     border: 'none',
    //                   }}
    //                 >
    //                   Logout
    //                 </button>
    //               </Nav.Link>
    //             </>
    //           ) : (
    //             <Nav.Link href='/login'>Login</Nav.Link>
    //           )}
    //           <div
    //             style={{
    //               display: 'flex',
    //               justifyContent: 'center',
    //               alignItems: 'center',
    //               cursor: 'pointer',
    //               padding: '0 0.5rem 0 0.5rem',
    //             }}
    //             onClick={() => window.open('https://github.com/cevo-public/cov-spectrum-website', '_blank')}
    //           >
    //             <AiOutlineGithub
    //               className='fill-current hover:text-gray-500 rounded-xl filter shadow-xl '
    //               size={'1.5em'}
    //             />
    //           </div>
    //         </Nav>
    //       </Navbar.Collapse>
    //     </div>
    //   </TopNavbar>
    //   <BottomNavbar bg='light' expand='md' className='bg-white text-xs flex flex-row'>
    //     <HeaderCountrySelect />
    //     <HeaderDateRangeSelect />
    //     <Navbar.Collapse>
    //       <HeaderSamplingStrategySelect />
    //       <Nav className='ml-4 mr-auto'>
    //         <Nav.Link href='/acknowledgements' style={{ textDecoration: 'underline' }}>
    //           Acknowledgements
    //         </Nav.Link>
    //         <Nav.Link href='/about' style={{ textDecoration: 'underline' }}>
    //           About
    //         </Nav.Link>
    //       </Nav>
    //     </Navbar.Collapse>
    //   </BottomNavbar>
    // </Wrapper>
  );
};

export default Header;