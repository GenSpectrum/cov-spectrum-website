import styled, { css } from 'styled-components';
import { scrollableContainerStyle } from './scrollable-container';

export const headerHeightPx = 0;

export const OuterWrapper = styled.div`
  display: grid;
  height: 100vh;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: ${headerHeightPx}px auto;
  grid-template-areas:
    'header header'
    'left right';

  @media (min-width: 1400px) {
    grid-template-columns: 700px auto;
  }
`;

export const HeaderWrapper = styled.div`
  grid-area: header;
`;

export const fullGridStyle = css`
  grid-row: 2;
  grid-column: left / right;
`;

export const RawFullContentWrapper = styled.div`
  ${fullGridStyle}
`;

export const LoginWrapper = styled.div`
  ${scrollableContainerStyle}
  ${fullGridStyle}
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  overflow-y: auto;
`;

export const SplitParentWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className='md:grid md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 h-full'>{children}</div>;
};

export const SplitExploreWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className='px-2 pt-2 md:px-4 md:col-span-1 lg:col-span-1 2xl:col-span-1'>{children}</div>;
};

export const SplitFocusWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className='px-2 md:pt-2 md:px-5 md:col-span-3 lg:col-span-4 2xl:col-span-5'>{children}</div>;
};

export const ScrollableFullContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className='h-full px-2'>{children}</div>;
};
