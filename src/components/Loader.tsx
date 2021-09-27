import * as React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5rem;
  height: 100%;
`;

const Loader = () => {
  return (
    <div className='flex justify-center items-center h-full p-20'>
      <Spinner animation='border' role='status'>
        <span className='sr-only'>Loading...</span>
      </Spinner>
    </div>
  );
};

export const InputLoader = () => {
  return (
    <div className='flex justify-center items-center w-full my-1'>
      <div className='animate-pulse w-full'>
        {' '}
        <div className='h-8 bg-gradient-to-r from-gray-400 to-gray-300 rounded w-full'></div>
      </div>
    </div>
  );
};

export default Loader;
