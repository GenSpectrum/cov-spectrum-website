import { css } from 'styled-components';

export const scrollableContainerPaddingPx = 15;

export const scrollableContainerStyle = css`
  height: 100%;
  box-sizing: border-box;
  padding: ${scrollableContainerPaddingPx}px;
  overflow-x: hidden;
  overflow-y: scroll;
`;
