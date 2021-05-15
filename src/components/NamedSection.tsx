import { divide } from 'lodash';
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
      <div id="title" className="relative text-xl font-bold text-black sm:text-3xl drop-shadow" >
        {title}
        <ToolbarWrapper>{toolbar}</ToolbarWrapper>
      </div>
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
};
