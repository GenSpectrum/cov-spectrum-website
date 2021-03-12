import React, { useMemo } from 'react';
import { generatePath, Route, Switch, useHistory, useParams, useRouteMatch } from 'react-router';
import { ExploreWrapper, FocusWrapper, RawFullContentWrapper } from '../helpers/app-layout';
import { ZodQueryEncoder } from '../helpers/query-encoder';
import { VariantSelector, VariantSelectorSchema } from '../helpers/sample-selector';
import { DeepFocusPage } from '../pages/DeepFocusPage';
import { ExplorePage } from '../pages/ExplorePage';
import { FocusEmptyPage } from '../pages/FocusEmptyPage';
import { FocusPage } from '../pages/FocusPage';
import { SamplingStrategy } from '../services/api';
import { Country } from '../services/api-types';

const queryEncoder = new ZodQueryEncoder(VariantSelectorSchema);

export function getFocusPageLink(
  variantSelector: VariantSelector,
  country: Country,
  deepFocusPath: string = ''
) {
  return (
    generatePath(`/explore/${country}/variants/:variantSelector`, {
      variantSelector: queryEncoder.encode(variantSelector).toString(),
    }) + deepFocusPath
  );
}

interface Props {
  samplingStrategy: SamplingStrategy;
}

export const ExploreFocusSplit = ({ samplingStrategy }: Props) => {
  const { country } = useParams<{ country: string }>();

  const { path } = useRouteMatch();
  const variantRouteMatch = useRouteMatch<{ variantSelector: string }>(`${path}/variants/:variantSelector`);
  const encodedVariantSelector = variantRouteMatch?.params.variantSelector;
  const variantSelector = useMemo(() => {
    try {
      if (encodedVariantSelector) {
        return queryEncoder.decode(new URLSearchParams(encodedVariantSelector));
      }
    } catch (err) {
      console.error('could not decode variant selector', encodedVariantSelector);
    }
  }, [encodedVariantSelector]);

  const history = useHistory();

  const explorePage = (
    <ExploreWrapper>
      <ExplorePage
        country={country}
        onVariantSelect={variant => history.push(getFocusPageLink(variant, country))}
        selection={variantSelector}
      />
    </ExploreWrapper>
  );

  const focusKey = `${encodedVariantSelector}-${samplingStrategy}`;

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
