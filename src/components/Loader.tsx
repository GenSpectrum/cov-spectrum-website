import * as React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { Grid } from './KnownVariantsList/KnownVariantsList';

const LOADER_COLORS = 'gray';

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
        <div
          className={`h-8 bg-gradient-to-r from-${LOADER_COLORS}-400 to-${LOADER_COLORS}-300 rounded w-full`}
        ></div>
      </div>
    </div>
  );
};

const KnownVariantCardLoader = (
  <div className='animate-pulse w-full'>
    <div
      className={`h-20 bg-gradient-to-r from-${LOADER_COLORS}-400 to-${LOADER_COLORS}-300 rounded w-full`}
    ></div>
  </div>
);

const getLoadVariantCardLoaders = () => {
  let loaders = [];
  for (let i = 0; i < 12; i++) {
    loaders.push(KnownVariantCardLoader);
  }
  return loaders;
};

export const KnownVariantLoader = () => {
  const loaders = getLoadVariantCardLoaders();

  return <Grid>{loaders}</Grid>;
};

export default Loader;
