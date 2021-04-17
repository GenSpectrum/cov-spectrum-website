import React from 'react';
import { AsyncState } from 'react-async';
import { Alert, Button } from 'react-bootstrap';
import { Route, useRouteMatch, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { InternationalComparison } from '../components/InternationalComparison';
import Loader from '../components/Loader';
import { MinimalWidgetLayout } from '../components/MinimalWidgetLayout';
import { SampleTable } from '../components/SampleTable';
import { VariantHeader } from '../components/VariantHeader';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { scrollableContainerPaddingPx, scrollableContainerStyle } from '../helpers/scrollable-container';
import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';
import { SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, Variant } from '../services/api-types';
import { HospitalizationDeathDeepFocus } from '../components/HospitalizationDeathDeepFocus';

interface SyncProps {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
}

interface AsyncProps {
  variantInternationalSampleSetState: AsyncState<SampleSetWithSelector>;
  wholeInternationalSampleSetState: AsyncState<SampleSetWithSelector>;
}

interface LoadedAsyncProps {
  variantInternationalSampleSet: SampleSetWithSelector;
  wholeInternationalSampleSet: SampleSetWithSelector;
}

type Props = SyncProps & AsyncProps;
type LoadedProps = SyncProps & LoadedAsyncProps;

interface DeepFocusRoute {
  key: string;
  title: string;
  content: (props: LoadedProps) => JSX.Element;
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

const routes: DeepFocusRoute[] = [
  {
    key: 'samples',
    title: 'Samples',
    content: props => <SampleTable {...props} />,
  },
  {
    key: 'international-comparison',
    title: 'International comparison',
    content: props => <InternationalComparison {...props} />,
  },
  {
    key: 'chen-2021-fitness',
    title: 'Fitness advantage estimation',
    content: props => (
      <Chen2021FitnessWidget.ShareableComponent
        country={props.country}
        matchPercentage={props.matchPercentage}
        mutations={props.variant.mutations}
        samplingStrategy={toLiteralSamplingStrategy(props.samplingStrategy)}
        widgetLayout={MinimalWidgetLayout}
        title='Fitness advantage estimation'
      />
    ),
  },
  {
    key: 'hospitalization-death',
    title: 'Hospitalization and death',
    content: props => (
      <HospitalizationDeathDeepFocus
        country={props.country}
        variantName={props.variant.name || 'unnamed variant'}
        variantSampleSet={props.variantSampleSet}
        wholeSampleSet={props.wholeSampleSet}
      />
    ),
  },
];

export const DeepFocusPage = ({
  variantInternationalSampleSetState,
  wholeInternationalSampleSetState,
  ...syncProps
}: Props) => {
  const { path, url } = useRouteMatch();

  const makeLayout = (content: JSX.Element) => (
    <OuterWrapper>
      <HeaderWrapper>
        <VariantHeader
          variant={syncProps.variant}
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
      <ContentWrapper>{content}</ContentWrapper>
    </OuterWrapper>
  );

  if (
    variantInternationalSampleSetState.status === 'initial' ||
    variantInternationalSampleSetState.status === 'pending' ||
    wholeInternationalSampleSetState.status === 'initial' ||
    wholeInternationalSampleSetState.status === 'pending'
  ) {
    return makeLayout(<Loader />);
  }

  if (
    variantInternationalSampleSetState.status === 'rejected' ||
    wholeInternationalSampleSetState.status === 'rejected'
  ) {
    return makeLayout(<Alert variant='danger'>Failed to load samples</Alert>);
  }

  const loadedProps = {
    ...syncProps,
    variantInternationalSampleSet: variantInternationalSampleSetState.data,
    wholeInternationalSampleSet: wholeInternationalSampleSetState.data,
  };

  return makeLayout(
    <Switch>
      {routes.map(route => (
        <Route key={route.key} path={`${path}/${route.key}`}>
          {route.content(loadedProps)}
        </Route>
      ))}
    </Switch>
  );
};
