import React, { useMemo } from 'react';
import { PromiseFn, useAsync } from 'react-async';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router';
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
  const wholeSampleSetState = useAsync<SampleSetWithSelector>(wholeSampleSetPromiseFn);

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

  return (
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
          <FocusWrapper>
            {variantSelector && (
              <FocusPage
                {...variantSelector}
                key={focusKey}
                country={country}
                samplingStrategy={samplingStrategy}
                wholeSampleSetState={wholeSampleSetState}
              />
            )}
          </FocusWrapper>
        </Route>
        <Route path={`${path}/variants/:variantSelector`}>
          <RawFullContentWrapper>
            {variantSelector && (
              <DeepFocusPage
                {...variantSelector}
                key={focusKey}
                country={country}
                samplingStrategy={samplingStrategy}
              />
            )}
          </RawFullContentWrapper>
        </Route>
      </Switch>
    </>
  );
};
