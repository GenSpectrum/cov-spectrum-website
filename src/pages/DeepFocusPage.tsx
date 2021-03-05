import React from 'react';
import { Button } from 'react-bootstrap';
import { Route, useRouteMatch, Switch } from 'react-router';
import styled from 'styled-components';
import { SampleTable } from '../components/SampleTable';
import { VariantHeader } from '../components/VariantHeader';
import { scrollableContainerPaddingPx, scrollableContainerStyle } from '../helpers/scrollable-container';
import { Country, Variant } from '../services/api-types';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
}

const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const HeaderWrapper = styled.div`
  padding: ${scrollableContainerPaddingPx}px;
  border-bottom: 1px solid #dee2e6;
  background: var(--light);
`;

const ContentWrapper = styled.div`
  ${scrollableContainerStyle}
  height: 100px;
  flex-grow: 1;
`;

export const DeepFocusPage = (props: Props) => {
  const { variant } = props;

  const { path } = useRouteMatch();

  return (
    <OuterWrapper>
      <HeaderWrapper>
        <VariantHeader
          variant={variant}
          controls={<Button variant='outline-secondary'>Back to overview</Button>}
        />
      </HeaderWrapper>
      <ContentWrapper>
        <Switch>
          <Route path={`${path}/samples`}>
            <SampleTable {...props} />
          </Route>
        </Switch>
      </ContentWrapper>
    </OuterWrapper>
  );
};
