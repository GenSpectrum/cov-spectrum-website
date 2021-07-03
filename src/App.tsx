import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Header from './Header';
import { LoginWrapper } from './helpers/app-layout';
import { AboutPage } from './pages/AboutPage';
import { ExploreFocusSplit } from './pages/ExploreFocusSplit';
import { GlobalSamplePage } from './pages/GlobalSamplePage';
import { LoginPage } from './pages/LoginPage';
import { SamplingStrategy } from './services/api';
import { useResizeDetector } from 'react-resize-detector';
import { Alert, AlertVariant } from './helpers/ui';
import { StoryOverviewPage } from './pages/StoryOverviewPage';
import { WasteWaterStoryPage } from './models/wasteWater/story/WasteWaterStoryPage';
import { WasteWaterLocationPage } from './models/wasteWater/story/WasteWaterLocationPage';

const isPreview = !!process.env.REACT_APP_IS_VERCEL_DEPLOYMENT;

export const App = () => {
  const { width, ref } = useResizeDetector<HTMLDivElement>();
  const isSmallScreen = width !== undefined && width <= 1000;

  return (
    <div className='pt-32 md:pt-20 h-screen w-full overflow-hidden'>
      <div className='fixed top-0 inset-x-0 h-32 md:h-20 z-50'>
        <Header />
      </div>
      <div ref={ref} className='static w-full h-full z-0 overflow-auto'>
        {isPreview && (
          <Alert variant={AlertVariant.WARNING}>
            <div className='text-center font-bold'>
              Note: This is a preview deployment. Please visit{' '}
              <a href='https://cov-spectrum.ethz.ch'>https://cov-spectrum.ethz.ch</a> for the official
              website.
            </div>
          </Alert>
        )}
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
          <Route exact path='/story'>
            <StoryOverviewPage />
          </Route>
          <Route exact path='/story/wastewater-in-switzerland'>
            <WasteWaterStoryPage />
          </Route>
          <Route path='/story/wastewater-in-switzerland/location/:location'>
            <WasteWaterLocationPage />
          </Route>
          <Route path='/about'>
            <AboutPage />
          </Route>
        </Switch>
      </div>
    </div>
  );
};
