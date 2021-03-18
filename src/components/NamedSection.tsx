import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
  children: React.ReactChild | React.ReactChild[];
  raised?: boolean;
}

const Title = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
`;

const RaisedContentWrapper = styled.div``;

const FlatContentWrapper = styled.div`
  margin-bottom: 30px;
`;

export const NamedSection = ({ title, children, raised }: Props) => {
  return (
    <>
      <Title>{title}</Title>
      {raised ? (
        <RaisedContentWrapper>{children}</RaisedContentWrapper>
      ) : (
        <FlatContentWrapper>{children}</FlatContentWrapper>
      )}
    </>
  );
};
