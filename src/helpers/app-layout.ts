import styled, { css } from 'styled-components';
import { scrollableContainerStyle } from './scrollable-container';

export const OuterWrapper = styled.div`
  display: grid;
  height: 100vh;
  grid-template-columns: minmax(auto, 700px) auto;
  grid-template-rows: 60px auto;
  grid-template-areas:
    'header header'
    'left right';
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
  padding: 0 0 10px 10px;
`;

export const FocusWrapper = styled.div`
  ${scrollableContainerStyle}
  grid-area: right;
  padding: 5px;
`;
