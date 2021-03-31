import React from 'react';
import { Button } from 'react-bootstrap';
import { Route, useRouteMatch, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { InternationalComparison } from '../components/InternationalComparison';
import { MinimalWidgetLayout } from '../components/MinimalWidgetLayout';
import { SampleTable } from '../components/SampleTable';
import { VariantHeader } from '../components/VariantHeader';
import { scrollableContainerPaddingPx, scrollableContainerStyle } from '../helpers/scrollable-container';
import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';
import { SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
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
  background: var(--light);
`;

const ContentWrapper = styled.div`
  ${scrollableContainerStyle}
  height: 100px;
  flex-grow: 1;
`;

export const DeepFocusPage = (props: Props) => {
  const { variant } = props;

  const { path, url } = useRouteMatch();

  const plotProps = {
    country: props.country,
    matchPercentage: props.matchPercentage,
    mutations: props.variant.mutations,
    samplingStrategy: toLiteralSamplingStrategy(props.samplingStrategy),
  };

  const routes = [
    {
      key: 'samples',
      title: 'Samples',
      content: <SampleTable {...props} />,
    },
    {
      key: 'international-comparison',
      title: 'International comparison',
      content: <InternationalComparison {...props} />,
    },
    {
      key: 'chen-2021-fitness',
      title: 'Fitness advantage estimation',
      content: (
        <Chen2021FitnessWidget.ShareableComponent
          {...plotProps}
          widgetLayout={MinimalWidgetLayout}
          title='Fitness advantage estimation'
        />
      ),
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
