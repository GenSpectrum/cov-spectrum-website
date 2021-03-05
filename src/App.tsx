import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Footer } from './Footer';
import { Header } from './Header';
import { scrollableContainerStyle } from './helpers/scrollable-container';
import { AboutPage } from './pages/AboutPage';
import { ExploreFocusSplit } from './pages/ExploreFocusSplit';
import { LoginPage } from './pages/LoginPage';
import { SamplePage } from './pages/SamplePage';

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

export const App = () => {
  return (
    <OuterWrapper>
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>

      <Switch>
        <Route exact path='/'>
          <Redirect to='/explore/Switzerland' />
        </Route>
        <Route path='/login'>
          <LoginWrapper>
            <LoginPage />
          </LoginWrapper>
        </Route>
        <Route path='/explore/:country'>
          <ExploreFocusSplit />
        </Route>
        <Route path='/sample'>
          <FullContentWrapper>
            <SamplePage />
          </FullContentWrapper>
        </Route>
        <Route path='/about'>
          <FullContentWrapper>
            <AboutPage />
          </FullContentWrapper>
        </Route>
      </Switch>

      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    </OuterWrapper>
  );
};
