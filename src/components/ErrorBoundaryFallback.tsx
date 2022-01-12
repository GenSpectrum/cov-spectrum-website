import React from 'react';

export const ErrorBoundaryFallback = () => {
  return (
    <p>
      Something went wrong.{' '}
      <button className='underline cursor-pointer outline-none' onClick={() => window.location.reload()}>
        Please try reloading the page.
      </button>
    </p>
  );
};
