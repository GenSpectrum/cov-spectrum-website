import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';
import {
  FooterWrapper,
  ScrollableFullContentWrapper,
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
          <ScrollableFullContentWrapper>
            <SamplePage />
          </ScrollableFullContentWrapper>
        </Route>
        <Route path='/about'>
          <ScrollableFullContentWrapper>
            <AboutPage />
          </ScrollableFullContentWrapper>
        </Route>
      </Switch>

      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    </OuterWrapper>
  );
};
