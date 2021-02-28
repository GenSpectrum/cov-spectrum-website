import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: 100%;
  background: var(--light);
  text-align: right;
  padding: 20px;
`;

export const Footer = () => {
  return (
    <Wrapper>
      Enabled by the data from the{' '}
      <a
        href='https://bsse.ethz.ch/cevo/research/sars-cov-2/swiss-sequencing-consortium---viollier.html'
        rel='noreferrer'
        target='_blank'
      >
        Swiss SARS-CoV-2 Sequencing Consortium (S3C)
      </a>{' '}
      and{' '}
      <a href='https://gisaid.org' rel='noreferrer' target='_blank'>
        <img alt='GISAID' style={{ height: '18px' }} src='/img/gisaid.png' />
      </a>
    </Wrapper>
  );
};
