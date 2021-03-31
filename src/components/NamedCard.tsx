import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
  toolbar?: React.ReactChild | React.ReactChild[];
  children: React.ReactChild | React.ReactChild[];
}

const Card = styled.div`
  position: relative;
  margin: 5px;
  background: white;
  padding: 12px 15px;
  border: 1px solid #0000001f;
  box-shadow: #00000059 0 2px 3px 0px;
`;

const Title = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
`;

const ToolbarWrapper = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`;

const ContentWrapper = styled.div`
  margin-bottom: 30px;
`;

export const NamedCard = ({ title, toolbar, children }: Props) => {
  return (
    <Card>
      <Title>{title}</Title>
      <ToolbarWrapper>{toolbar}</ToolbarWrapper>
      <ContentWrapper>{children}</ContentWrapper>
    </Card>
  );
};
