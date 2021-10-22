import * as React from 'react';
import Spinner from 'react-bootstrap/Spinner';

const Loader = () => {
  return (
    <div className='flex justify-center items-center h-full p-20'>
      <Spinner animation='border' role='status'>
        <span className='sr-only'>Loading...</span>
      </Spinner>
    </div>
  );
};

export const LoaderSmall = () => {
  return (
    <div className='flex justify-center items-center p-2 m-auto'>
      <Spinner animation='border' role='status'>
        <span className='sr-only'>Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loader;
