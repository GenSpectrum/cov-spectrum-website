import React from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router';
import { ExploreWrapper, FocusWrapper, RawFullContentWrapper } from '../helpers/app-layout';
import { getFocusPageLink, useExploreUrl } from '../helpers/explore-url';
import { DeepFocusPage } from '../pages/DeepFocusPage';
import { ExplorePage } from '../pages/ExplorePage';
import { FocusEmptyPage } from '../pages/FocusEmptyPage';
import { FocusPage } from '../pages/FocusPage';

export const ExploreFocusSplit = () => {
  const { country, samplingStrategy, variantSelector, focusKey } = useExploreUrl() || {};

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
