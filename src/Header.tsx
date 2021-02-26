import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { AccountService } from './services/AccountService';

export const Header = () => {
  const loggedIn = AccountService.isLoggedIn();
  let username = null;
  if (loggedIn) {
    username = AccountService.getUsername();
  }

  return (
    <Navbar bg='light' expand='md'>
      <Navbar.Brand href='/variant'>CoV-Spectrum</Navbar.Brand>
      <Navbar.Toggle aria-controls='basic-navbar-nav' />
      <Navbar.Collapse>
        <Nav className='mr-auto'></Nav>
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
            <Nav.Link href='/login'>Login</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
