import React from 'react';
import { Form, Nav, Navbar } from 'react-bootstrap';
import { AccountService } from './services/AccountService';
import {
  RequiredCountrySelect,
  Props as RequiredCountrySelectProps,
} from './components/RequiredCountrySelect';
import { Link, Route } from 'react-router-dom';

interface Props {
  countryProps: Omit<RequiredCountrySelectProps, 'id'>;
}

export const Header = ({ countryProps }: Props) => {
  const loggedIn = AccountService.isLoggedIn();
  let username = null;
  if (loggedIn) {
    username = AccountService.getUsername();
  }

  return (
    <Navbar bg='light' expand='md' style={{ height: '100%' }}>
      <Navbar.Brand as={Link} to='/variant'>
        <span style={{color: 'darkgray', fontWeight: 'bold'}}>cov</span>
        <span style={{color: '#0D4A70', fontWeight: 'bold'}}>S</span>
        <span style={{color: '#245C70', fontWeight: 'bold'}}>P</span>
        <span style={{color: '#3A6E6F', fontWeight: 'bold'}}>E</span>
        <span style={{color: '#67916E', fontWeight: 'bold'}}>C</span>
        <span style={{color: '#AC8D3A', fontWeight: 'bold'}}>T</span>
        <span style={{color: '#CF8B20', fontWeight: 'bold'}}>R</span>
        <span style={{color: '#E08A13', fontWeight: 'bold'}}>U</span>
        <span style={{color: '#F18805', fontWeight: 'bold'}}>M</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls='basic-navbar-nav' />
      <Navbar.Collapse>
        <Nav className='ml-4 mr-auto'>
          <Route path='/variant'>
            <Form inline>
              <Form.Label htmlFor='countrySelect' className='mr-2'>
                Country
              </Form.Label>
              <RequiredCountrySelect {...countryProps} id='countrySelect' />
            </Form>
          </Route>
          <Nav.Link href='/about' style={{ marginLeft: '20px', textDecoration: 'underline' }}>
            What is this website?
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
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
