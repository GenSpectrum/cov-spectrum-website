import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';
import {
  FooterWrapper,
  FullContentWrapper,
  HeaderWrapper,
  LoginWrapper,
  OuterWrapper,
} from './helpers/app-layout';
import { AboutPage } from './pages/AboutPage';
import { ExploreFocusSplit } from './pages/ExploreFocusSplit';
import { LoginPage } from './pages/LoginPage';
import { SamplePage } from './pages/SamplePage';

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
