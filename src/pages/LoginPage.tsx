import React, { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useLocation } from 'react-router-dom';
import { AccountService } from '../services/AccountService';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const LoginPage = () => {
  const query = useQuery();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);
  const sessionExpired = query.get('expired') !== null;
  const loggedOut = query.get('left') !== null;

  if (AccountService.isLoggedIn()) {
    window.location.href = '/';
  }

  const handleSubmit = async () => {
    if (!username || !password) {
      return;
    }
    try {
      await AccountService.login(username, password);
      window.location.href = '/';
    } catch (err) {
      console.error('login failed', err);
      setLoginFailed(true);
    }
  };

  return (
    <>
      <h1>Login</h1>
      <Form>
        <Form.Group controlId='loginUsername'>
          <Form.Label>Username</Form.Label>
          <Form.Control required type='text' onChange={e => setUsername(e.target.value)} />
        </Form.Group>
        <Form.Group controlId='loginPassword'>
          <Form.Label>Password</Form.Label>
          <Form.Control required type='password' onChange={e => setPassword(e.target.value)} />
        </Form.Group>
        <Button variant='primary' onClick={handleSubmit}>
          Login
        </Button>
      </Form>
      {loginFailed && (
        <Alert variant='info' style={{ marginTop: '20px' }}>
          The login attempt was not successful.
        </Alert>
      )}
      {sessionExpired && (
        <Alert variant='info' style={{ marginTop: '20px' }}>
          The session has expired. Please login again.
        </Alert>
      )}
      {loggedOut && (
        <Alert variant='info' style={{ marginTop: '20px' }}>
          You logged out.
        </Alert>
      )}
    </>
  );
};
