import React from 'react';
import { Button } from 'react-bootstrap';
import { Route, useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import { InternationalComparison } from '../components/InternationalComparison';
import { VariantHeader } from '../components/VariantHeader';
import { HospitalizationDeathDeepFocus } from '../components/HospitalizationDeathDeepFocus';
import { WasteWaterDeepFocus } from '../models/wasteWater/WasteWaterDeepFocus';
import { DeepRoute, makeLayout, makeSwitch } from '../helpers/deep-page';
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { formatVariantDisplayName } from '../data/VariantSelector';
import { MinimalWidgetLayout } from '../components/MinimalWidgetLayout';
import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';
import { useExploreUrl } from '../helpers/explore-url';

interface SyncProps {
  variantDataset: DetailedSampleAggDataset;
  wholeDataset: DetailedSampleAggDataset;
  variantInternationalDateCountDataset: CountryDateCountSampleDataset;
  wholeInternationalDateCountDataset: CountryDateCountSampleDataset;
}

type Props = SyncProps;
type LoadedProps = SyncProps;

const routes: DeepRoute<LoadedProps>[] = [
  {
    key: 'international-comparison',
    title: 'International comparison',
    content: props => (
      <InternationalComparison
        locationSelector={props.variantDataset.getSelector().location}
        variantInternationalDateCountDataset={props.variantInternationalDateCountDataset}
        wholeInternationalDateCountDataset={props.wholeInternationalDateCountDataset}
      />
    ),
  },
  {
    key: 'chen-2021-fitness',
    title: 'Transmission advantage',
    content: props => (
      <Chen2021FitnessWidget.ShareableComponent
        locationSelector={props.variantDataset.getSelector().location}
        variantSelector={props.variantDataset.getSelector().variant!}
        widgetLayout={MinimalWidgetLayout}
        title='Transmission advantage'
      />
    ),
  },
  {
    key: 'hospitalization-death',
    title: 'Hospitalization and death',
    content: props => (
      <HospitalizationDeathDeepFocus
        variantName={formatVariantDisplayName(props.variantDataset.getSelector().variant!, true)}
        variantSampleSet={props.variantDataset}
        wholeSampleSet={props.wholeDataset}
      />
    ),
  },
  {
    key: 'waste-water',
    title: 'Wastewater prevalence',
    content: props => {
      const country = props.variantDataset.getSelector().location.country;
      if (country !== 'Switzerland') {
        return <>Nothing to see here.</>;
      }
      return (
        <WasteWaterDeepFocus
          country={country}
          variantName={props.variantDataset.getSelector().variant?.pangoLineage}
        />
      );
    },
  },
];

export const DeepFocusPage = ({ ...syncProps }: Props) => {
  const { path } = useRouteMatch();
  const overviewPageUrl = useExploreUrl()?.getOverviewPageUrl() ?? '#';
  if (!syncProps.variantDataset.getSelector().variant) {
    return <></>;
  }
  const _makeLayout = (content: JSX.Element) =>
    makeLayout(
      <VariantHeader
        dateRange={syncProps.variantDataset.getSelector().dateRange!} // TODO is date range always available?
        variant={syncProps.variantDataset.getSelector().variant!}
        controls={
          <Button className='mt-2' variant='secondary' as={Link} to={overviewPageUrl}>
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

  const loadedProps = {
    ...syncProps,
  };

  return _makeLayout(makeSwitch(routes, loadedProps, path));
};
