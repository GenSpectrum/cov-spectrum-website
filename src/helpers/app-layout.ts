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
  background: var(--light);
`;

export const HeaderWrapper = styled.div`
  grid-area: header;
  z-index: 1;
  box-shadow: #00000059 0 2px 7px 0px;
  background: white;
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
  box-shadow: #00000059 0 2px 3px 0px;
`;

export const FocusWrapper = styled.div`
  ${scrollableContainerStyle}
  grid-area: right;
  padding: 20px 5px 15px 5px;
`;
