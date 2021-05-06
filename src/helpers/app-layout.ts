import styled, { css } from 'styled-components';
import { scrollableContainerStyle } from './scrollable-container';

export const OuterWrapper = styled.div`
  display: grid;
  height: 100vh;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 100px auto;
  grid-template-areas:
    'header header'
    'left right';

  @media (min-width: 1400px) {
    grid-template-columns: 700px auto;
  }
`;

export const HeaderWrapper = styled.div`
  grid-area: header;
  border-bottom: 1px solid #dee2e6;
`;

export const fullGridStyle = css`
  grid-row: 2;
  grid-column: left / right;
`;

export const RawFullContentWrapper = styled.div`
  ${fullGridStyle}
  width: 100vw;
`;

export const ScrollableFullContentWrapper = styled.div`
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
