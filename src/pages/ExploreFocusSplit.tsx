import React, { useState } from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { scrollableContainerStyle } from '../helpers/scrollable-container';
import { ExplorePage } from '../pages/ExplorePage';
import { FocusEmptyPage } from '../pages/FocusEmptyPage';
import { FocusPage } from '../pages/FocusPage';
import { Selection } from '../services/api-types';

export const ExploreWrapper = styled.div`
  grid-area: left;
  overflow: hidden;
  border-right: 1px solid #dee2e6;
`;

export const FocusWrapper = styled.div`
  ${scrollableContainerStyle}
  grid-area: right;
`;

export const ExploreFocusSplit = () => {
  const { country } = useParams<{ country: string }>();

  const [selection, setSelection] = useState<Selection | undefined>(undefined);

  return (
    <>
      <ExploreWrapper>
        <ExplorePage country={country} onVariantSelect={setSelection} selection={selection} />
      </ExploreWrapper>
      <FocusWrapper>
        {selection && <FocusPage {...selection} country={country} />}
        {!selection && <FocusEmptyPage />}
      </FocusWrapper>
    </>
  );
};
