import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Header from './Header';
import {
  HeaderWrapper,
  LoginWrapper,
  OuterWrapper,
  ScrollableFullContentWrapper,
} from './helpers/app-layout';
import { AboutPage } from './pages/AboutPage';
import { ExploreFocusSplit } from './pages/ExploreFocusSplit';
import { GlobalSamplePage } from './pages/GlobalSamplePage';
import { LoginPage } from './pages/LoginPage';
import { SamplingStrategy } from './services/api';
import { AcknowledgementsPage } from './pages/AcknowledgementsPage';
import { useResizeDetector } from 'react-resize-detector';

export const App = () => {
  const { width, ref } = useResizeDetector<HTMLDivElement>();
  const isSmallScreen = width !== undefined && width <= 1000;

  return (
    <div className='pt-32 md:pt-20 h-screen w-full'>
      <div className='fixed top-0 inset-x-0 h-32 md:h-20 z-50'>
        <Header />
      </div>
      <div ref={ref} className='static w-full h-full z-0'>
        <Switch>
          <Route exact path='/'>
            <Redirect to={`/explore/Switzerland/${SamplingStrategy.AllSamples}/AllTimes`} />
          </Route>
          <Route path='/variant'>
            <Redirect to='/' />
          </Route>
          <Route path='/login'>
            <LoginWrapper>
              <LoginPage />
            </LoginWrapper>
          </Route>
          <Route path='/explore/:country/:samplingStrategy/:dateRange'>
            <ExploreFocusSplit isSmallScreen={isSmallScreen} />
          </Route>
          <Route path='/global-samples'>
              <GlobalSamplePage />
          </Route>
          <Route path='/about'>
              <AboutPage />
          </Route>
          <Route path='/acknowledgements'>
              <AcknowledgementsPage />
          </Route>
        </Switch>
      </div>
    </div>
  );
};
