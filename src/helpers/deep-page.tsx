/**
 * This file contains helper functions that are shared by the Deep... pages.
 */

import React, { JSX } from 'react';
import styled from 'styled-components';
import Loader from '../components/Loader';

const HeaderWrapper = styled.div`
  border-bottom: 1px solid #dee2e6;
  background: var(--light);
  padding: 15px;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  padding: 15px;
`;

export function makeLayout(header: JSX.Element, content: JSX.Element | undefined) {
  return (
    <div className='flex flex-col bg-white'>
      <HeaderWrapper>{header}</HeaderWrapper>
      <ContentWrapper>{content ?? <Loader />}</ContentWrapper>
    </div>
  );
}
