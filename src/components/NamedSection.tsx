import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
  children: React.ReactChild | React.ReactChild[];
}

const ContentWrapper = styled.div`
  margin-bottom: 30px;
`;

export const NamedSection = ({ title, children }: Props) => {
  return (
    <>
      <h3>{title}</h3>
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
};
