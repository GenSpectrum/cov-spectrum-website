import React, { useMemo } from 'react';
import { generatePath, useHistory, useParams, useRouteMatch } from 'react-router';
import styled from 'styled-components';
import { ZodQueryEncoder } from '../helpers/query-encoder';
import { VariantSelector, VariantSelectorSchema } from '../helpers/sample-selector';
import { scrollableContainerStyle } from '../helpers/scrollable-container';
import { ExplorePage } from '../pages/ExplorePage';
import { FocusEmptyPage } from '../pages/FocusEmptyPage';
import { FocusPage } from '../pages/FocusPage';

export const ExploreWrapper = styled.div`
  grid-area: left;
  overflow: hidden;
  border-right: 1px solid #dee2e6;
`;

export const FocusWrapper = styled.div`
  ${scrollableContainerStyle}
  grid-area: right;
`;

const queryEncoder = new ZodQueryEncoder(VariantSelectorSchema);

export const ExploreFocusSplit = () => {
  const { country } = useParams<{ country: string }>();

  const { path, url } = useRouteMatch();
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

  const onVariantSelect = (variantSelector: VariantSelector) => {
    history.push(
      generatePath(`${url}/variants/:variantSelector`, {
        variantSelector: queryEncoder.encode(variantSelector).toString(),
      })
    );
  };

  return (
    <>
      <ExploreWrapper>
        <ExplorePage country={country} onVariantSelect={onVariantSelect} selection={variantSelector} />
      </ExploreWrapper>
      <FocusWrapper>
        {variantSelector ? <FocusPage {...variantSelector} country={country} /> : <FocusEmptyPage />}
      </FocusWrapper>
    </>
  );
};
