import React from 'react';
import { AsyncState } from 'react-async';
import { Button } from 'react-bootstrap';
import { Route, useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import { InternationalComparison } from '../components/InternationalComparison';
import Loader from '../components/Loader';
import { MinimalWidgetLayout } from '../components/MinimalWidgetLayout';
import { SampleTable } from '../components/SampleTable';
import { VariantHeader } from '../components/VariantHeader';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';
import { SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, DateRange, Variant } from '../services/api-types';
import { HospitalizationDeathDeepFocus } from '../components/HospitalizationDeathDeepFocus';
import { WasteWaterDeepFocus } from '../models/wasteWater/WasteWaterDeepFocus';
import { Alert, AlertVariant } from '../helpers/ui';
import { DeepRoute, makeLayout, makeSwitch } from '../helpers/deep-page';

interface SyncProps {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  dateRange: DateRange;
  variantSampleSet?: SampleSetWithSelector;
  wholeSampleSet?: SampleSetWithSelector;
  isDataPending: () => boolean;
  isDataRejected: () => boolean;
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

const routes: DeepRoute<LoadedProps>[] = [
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
    title: 'Transmission advantage',
    content: props => (
      <Chen2021FitnessWidget.ShareableComponent
        country={props.country}
        matchPercentage={props.matchPercentage}
        mutations={props.variant.mutations}
        pangolinLineage={props.variant.name}
        samplingStrategy={toLiteralSamplingStrategy(props.samplingStrategy)}
        widgetLayout={MinimalWidgetLayout}
        title='Transmission advantage'
      />
    ),
  },
  {
    key: 'hospitalization-death',
    title: 'Hospitalization and death',
    content: props =>
      props.variantSampleSet && props.wholeSampleSet ? (
        <HospitalizationDeathDeepFocus
          country={props.country}
          variantName={props.variant.name || 'unnamed variant'}
          variantSampleSet={props.variantSampleSet}
          wholeSampleSet={props.wholeSampleSet}
        />
      ) : (
        <Alert variant={AlertVariant.DANGER}>Failed to load samples</Alert>
      ),
  },
  {
    key: 'waste-water',
    title: 'Wastewater prevalence',
    content: props => <WasteWaterDeepFocus country={props.country} variantName={props.variant.name} />,
  },
];

export const DeepFocusPage = ({
  variantInternationalSampleSetState,
  wholeInternationalSampleSetState,
  ...syncProps
}: Props) => {
  const { path, url } = useRouteMatch();

  const _makeLayout = (content: JSX.Element) =>
    makeLayout(
      <VariantHeader
        variant={syncProps.variant}
        place={syncProps.country}
        dateRange={syncProps.dateRange}
        controls={
          <Button className='mt-2' variant='secondary' as={Link} to={url}>
            Back to overview
          </Button>
        }
        titleSuffix={routes.map(route => (
          <Route key={route.key} path={`${path}/${route.key}`}>
            {route.title}
          </Route>
        ))}
      />,
      content
    );

  if (
    variantInternationalSampleSetState.status === 'initial' ||
    variantInternationalSampleSetState.status === 'pending' ||
    wholeInternationalSampleSetState.status === 'initial' ||
    wholeInternationalSampleSetState.status === 'pending' ||
    syncProps.isDataPending()
  ) {
    return _makeLayout(<Loader />);
  }

  if (
    variantInternationalSampleSetState.status === 'rejected' ||
    wholeInternationalSampleSetState.status === 'rejected' ||
    syncProps.isDataRejected()
  ) {
    return _makeLayout(<Alert variant={AlertVariant.DANGER}>Failed to load samples</Alert>);
  }

  const loadedProps = {
    ...syncProps,
    variantInternationalSampleSet: variantInternationalSampleSetState.data,
    wholeInternationalSampleSet: wholeInternationalSampleSetState.data,
  };

  return _makeLayout(makeSwitch(routes, loadedProps, path));
};
