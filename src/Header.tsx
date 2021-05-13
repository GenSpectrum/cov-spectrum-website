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

export const Header = () => {
  const loggedIn = AccountService.isLoggedIn();
  let username = null;
  if (loggedIn) {
    username = AccountService.getUsername();
  }

  return (
    <Navbar bg='light' expand='md' style={{ height: '100%' }}>
      <BrandGisaidWrapper>
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
        <GisaidWrapper>
          Enabled by data from{' '}
          <ExternalLink url='https://gisaid.org/'>
            <img src='/img/gisaid.png' alt='GISAID' style={{ height: '20px' }} />
          </ExternalLink>
        </GisaidWrapper>
      </BrandGisaidWrapper>
      <Navbar.Toggle aria-controls='basic-navbar-nav' />
      <NavbarCollapseGlobalStyle />
      <Navbar.Collapse className={navbarCollapseClassName}>
        <Nav as={LeftNavGroup}>
          <HeaderCountrySelect />
          <HeaderSamplingStrategySelect />
          <HeaderDateRangeSelect />
          <Nav.Link href='/acknowledgements' style={{ textDecoration: 'underline' }}>
            Acknowledgements
          </Nav.Link>
          <Nav.Link href='/about' style={{ textDecoration: 'underline' }}>
            About
          </Nav.Link>
        </Nav>
        <Nav>
          {loggedIn ? (
            <>
              <Navbar.Text>Signed in as {username}</Navbar.Text>
              <Nav.Link>
                <button
                  onClick={() => {
                    AccountService.logout();
                    window.location.href = '/login?left';
                  }}
                  style={{
                    background: 'none',
                    outline: 'none',
                    border: 'none',
                  }}
                >
                  Logout
                </button>
              </Nav.Link>
            </>
          ) : (
            <Nav.Link href='/login'>Private Switzerland Login</Nav.Link>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '0 0.5rem 0 0.5rem',
            }}
            onClick={() => window.open('https://github.com/cevo-public/cov-spectrum-website', '_blank')}
          >
            <AiOutlineGithub size={'1.5em'} />
          </div>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
