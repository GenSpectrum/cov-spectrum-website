import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
  subtitle?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

const ContentWrapper = styled.div`
  margin-bottom: 30px;
`;

const ToolbarWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

export const NamedSection = ({ title, toolbar, children, subtitle }: Props) => {
  return (
    <>
      <div id='relative section-title' className='relative'>
        <h1>{title}</h1>
        {subtitle && (
          <h3 id={`chart-title-${title}`} className='my-0 pb-1 pr-10 pt-0 text-gray-500'>
            {subtitle}
          </h3>
        )}
        <ToolbarWrapper>{toolbar}</ToolbarWrapper>
      </div>
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
};
