import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
  children: React.ReactChild | React.ReactChild[];
  raised?: boolean;
}

const Title = styled.h3`
  margin: 0 4px 10px 4px;
`;

const RaisedContentWrapper = styled.div`
  margin-bottom: 20px;
  background: white;
  padding: 10px;
  border: 1px solid #00000020;
`;

const FlatContentWrapper = styled.div`
  margin-bottom: 30px;
`;

export const NamedSection = ({ title, children, raised }: Props) => {
  return (
    <>
      {raised ? <Title>{title}</Title> : <h3>{title}</h3>}
      {raised ? (
        <RaisedContentWrapper>{children}</RaisedContentWrapper>
      ) : (
        <FlatContentWrapper>{children}</FlatContentWrapper>
      )}
    </>
  );
};
