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
        CoV-Spectrum
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
          <Nav.Link href='/about' style={{marginLeft: '20px', textDecoration: 'underline'}}>
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
