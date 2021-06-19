/**
 * This file contains helper functions that are shared by the DeepExplorePage
 * and the DeepFocusPage.
 */

import React from 'react';
import styled from 'styled-components';
import { scrollableContainerPaddingPx, scrollableContainerStyle } from './scrollable-container';
import { Route, Switch } from 'react-router';

export interface DeepRoute<Props> {
  key: string;
  title: string;
  content: (props: Props) => JSX.Element;
}

const HeaderWrapper = styled.div`
  padding: ${scrollableContainerPaddingPx}px;
  border-bottom: 1px solid #dee2e6;
  background: var(--light);
`;

const ContentWrapper = styled.div`
  ${scrollableContainerStyle};
  height: 100px;
  flex-grow: 1;
`;

export function makeLayout(header: JSX.Element, content: JSX.Element) {
  return (
    <div className='flex flex-col h-full bg-white'>
      <HeaderWrapper>{header}</HeaderWrapper>
      <ContentWrapper>{content}</ContentWrapper>
    </div>
  );
}

export function makeSwitch<Props>(routes: DeepRoute<Props>[], props: Props, pathPrefix: string) {
  return (
    <Switch>
      {routes.map(route => (
        <Route key={route.key} path={`${pathPrefix}/${route.key}`}>
          {route.content(props)}
        </Route>
      ))}
    </Switch>
  );
}
