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
import { GlobalSamplePage } from './pages/GlobalSamplePage';

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
        <Route path='/variant'>
          {/* This is so that we don't break old bookmarked links */}
          <Redirect to='/' />
        </Route>
        <Route path='/login'>
          <LoginWrapper>
            <LoginPage />
          </LoginWrapper>
        </Route>
        <Route path='/explore/:country'>
          <ExploreFocusSplit />
        </Route>
        <Route path='/global-samples'>
          <ScrollableFullContentWrapper>
            <GlobalSamplePage />
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
