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
    <Wrapper>
      <Spinner animation='border' role='status'>
        <span className='sr-only'>Loading...</span>
      </Spinner>
    </Wrapper>
  );
};

export default Loader;
