import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

const ContentWrapper = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h3`
  position: relative;
`;

const ToolbarWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

export const NamedSection = ({ title, toolbar, children }: Props) => {
  return (
    <>
      <Title>
        {title}
        <ToolbarWrapper>{toolbar}</ToolbarWrapper>
      </Title>
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
};
