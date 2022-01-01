/**
 * This file contains helper functions that are shared by the DeepExplorePage
 * and the DeepFocusPage.
 */

import React from 'react';
import styled from 'styled-components';
import { Route, Switch } from 'react-router';

export interface DeepRoute<Props> {
  key: string;
  title: string;
  content: (props: Props) => JSX.Element;
}

const HeaderWrapper = styled.div`
  border-bottom: 1px solid #dee2e6;
  background: var(--light);
  padding: 15px;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  padding: 15px;
`;

export function makeLayout(header: JSX.Element, content: JSX.Element) {
  return (
    <div className='flex flex-col bg-white'>
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
