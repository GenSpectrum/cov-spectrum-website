import styled, { css } from 'styled-components';
import { scrollableContainerStyle } from './scrollable-container';

export const OuterWrapper = styled.div`
  display: grid;
  height: 100vh;
  grid-template-columns: 50% 50%;
  grid-template-rows: 60px auto 60px;
  grid-template-areas:
    'header header'
    'left right'
    'footer footer';
`;

export const HeaderWrapper = styled.div`
  grid-area: header;
  border-bottom: 1px solid #dee2e6;
`;

export const FooterWrapper = styled.div`
  border-top: 1px solid #dee2e6;
  grid-area: footer;
`;

export const fullGridStyle = css`
  grid-row: 2;
  grid-column: left / right;
`;

export const FullContentWrapper = styled.div`
  ${scrollableContainerStyle}
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

export const ExploreWrapper = styled.div`
  grid-area: left;
  overflow: hidden;
  border-right: 1px solid #dee2e6;
`;

export const FocusWrapper = styled.div`
  ${scrollableContainerStyle}
  grid-area: right;
`;
