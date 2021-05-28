import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useLocation } from 'react-router-dom';
import { Alert, AlertVariant} from '../helpers/ui';
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
    <div className='flex flex-col justify-center items-center mt-2 md:mt-10'>
      {loginFailed && (
        <Alert variant={AlertVariant.INFO}>
          The login attempt was not successful.
        </Alert>
      )}
      {sessionExpired && (
        <Alert variant={AlertVariant.INFO}>
          The session has expired. Please login again.
        </Alert>
      )}
      {loggedOut && (
        <Alert variant={AlertVariant.INFO}>
          You logged out.
        </Alert>
      )}
      <Form className='shadow-lg rounded-2xl w-64 bg-white relative overflow-hidden cursor-pointer p-8'>
        <p className='mb-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl'>Login</p>
        <p>Private Switzerland Data</p>
        <div className='mt-6' />
        <Form.Group controlId='loginUsername'>
          <Form.Label>Username</Form.Label>
          <Form.Control required type='text' onChange={e => setUsername(e.target.value)} />
        </Form.Group>
        <Form.Group controlId='loginPassword'>
          <Form.Label>Password</Form.Label>
          <Form.Control required type='password' onChange={e => setPassword(e.target.value)} />
        </Form.Group>
        <Button className='w-full' variant='primary' onClick={handleSubmit}>
          Login
        </Button>
      </Form>
    </div>
  );
};
