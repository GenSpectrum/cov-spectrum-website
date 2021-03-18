import React from 'react';
import { Button } from 'react-bootstrap';
import { Route, useRouteMatch, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { SampleTable } from '../components/SampleTable';
import { VariantHeader } from '../components/VariantHeader';
import { scrollableContainerPaddingPx, scrollableContainerStyle } from '../helpers/scrollable-container';
import { SamplingStrategy } from '../services/api';
import { Country, Variant } from '../services/api-types';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
}

const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const HeaderWrapper = styled.div`
  padding: ${scrollableContainerPaddingPx}px;
  border-bottom: 1px solid #dee2e6;
`;

const ContentWrapper = styled.div`
  ${scrollableContainerStyle}
  height: 100px;
  flex-grow: 1;
  background: white;
`;

export const DeepFocusPage = (props: Props) => {
  const { variant } = props;

  const { path, url } = useRouteMatch();

  const routes = [
    {
      key: 'samples',
      title: 'Samples',
      content: <SampleTable {...props} />,
    },
  ];

  return (
    <OuterWrapper>
      <HeaderWrapper>
        <VariantHeader
          variant={variant}
          controls={
            <Button variant='secondary' as={Link} to={url}>
              Back to overview
            </Button>
          }
          titleSuffix={routes.map(route => (
            <Route key={route.key} path={`${path}/${route.key}`}>
              {route.title}
            </Route>
          ))}
        />
      </HeaderWrapper>
      <ContentWrapper>
        <Switch>
          {routes.map(route => (
            <Route key={route.key} path={`${path}/${route.key}`}>
              {route.content}
            </Route>
          ))}
        </Switch>
      </ContentWrapper>
    </OuterWrapper>
  );
};
