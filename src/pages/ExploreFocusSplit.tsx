import React, { useMemo } from 'react';
import { PromiseFn, useAsync } from 'react-async';
import { Alert } from 'react-bootstrap';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router';
import Loader from '../components/Loader';
import { ExploreWrapper, FocusWrapper, RawFullContentWrapper } from '../helpers/app-layout';
import { getFocusPageLink, useExploreUrl } from '../helpers/explore-url';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { DeepFocusPage } from '../pages/DeepFocusPage';
import { ExplorePage } from '../pages/ExplorePage';
import { FocusEmptyPage } from '../pages/FocusEmptyPage';
import { FocusPage } from '../pages/FocusPage';
import { getNewSamples, toLiteralSamplingStrategy } from '../services/api';

export const ExploreFocusSplit = () => {
  const { country, samplingStrategy, variantSelector, focusKey } = useExploreUrl() || {};

  const sampleSetPromiseFn = useMemo<PromiseFn<SampleSetWithSelector | undefined>>(
    () => async (options, { signal }) =>
      variantSelector &&
      samplingStrategy &&
      getNewSamples(
        {
          country,
          matchPercentage: variantSelector.matchPercentage,
          mutations: variantSelector.variant.mutations,
          dataType: toLiteralSamplingStrategy(samplingStrategy),
        },
        signal
      ),
    [country, variantSelector, samplingStrategy]
  );
  const sampleSetState = useAsync(sampleSetPromiseFn);

  const wholeSampleSetPromiseFn = useMemo<PromiseFn<SampleSetWithSelector>>(
    () => (options, { signal }) => {
      if (!samplingStrategy) {
        // this error is never consumed since we do an early return below
        throw new Error('samplingStrategy is required');
      }
      return getNewSamples(
        {
          country,
          dataType: toLiteralSamplingStrategy(samplingStrategy),
        },
        signal
      );
    },
    [country, samplingStrategy]
  );
  const wholeSampleSetState = useAsync(wholeSampleSetPromiseFn);

  const { path } = useRouteMatch();

  const history = useHistory();

  if (!country || !samplingStrategy) {
    // This may happen during a redirect
    return null;
  }

  const explorePage = (
    <ExploreWrapper>
      <ExplorePage
        country={country}
        samplingStrategy={samplingStrategy}
        onVariantSelect={variantSelector =>
          history.push(getFocusPageLink({ variantSelector, country, samplingStrategy }))
        }
        selection={variantSelector}
      />
    </ExploreWrapper>
  );

  const makeLayout = (focusContent: React.ReactNode, deepFocusContent: React.ReactNode): JSX.Element => (
    <>
      <Switch>
        <Route exact path={`${path}`}>
          {explorePage}
          <FocusWrapper>
            <FocusEmptyPage />
          </FocusWrapper>
        </Route>
        <Route exact path={`${path}/variants/:variantSelector`}>
          {explorePage}
          <FocusWrapper>{focusContent}</FocusWrapper>
        </Route>
        <Route path={`${path}/variants/:variantSelector`}>
          <RawFullContentWrapper>{deepFocusContent}</RawFullContentWrapper>
        </Route>
      </Switch>
    </>
  );

  if (
    wholeSampleSetState.status === 'initial' ||
    wholeSampleSetState.status === 'pending' ||
    sampleSetState.status === 'initial' ||
    sampleSetState.status === 'pending'
  ) {
    return makeLayout(<Loader />, <Loader />);
  }

  if (wholeSampleSetState.status === 'rejected' || sampleSetState.status === 'rejected') {
    const alert = <Alert variant='danger'>Failed to load samples</Alert>;
    return makeLayout(alert, alert);
  }

  return makeLayout(
    variantSelector && sampleSetState.data && (
      <FocusPage
        {...variantSelector}
        key={focusKey}
        country={country}
        samplingStrategy={samplingStrategy}
        sampleSet={sampleSetState.data}
        wholeSampleSet={wholeSampleSetState.data}
      />
    ),
    variantSelector && (
      <DeepFocusPage
        {...variantSelector}
        key={focusKey}
        country={country}
        samplingStrategy={samplingStrategy}
      />
    )
  );
};
