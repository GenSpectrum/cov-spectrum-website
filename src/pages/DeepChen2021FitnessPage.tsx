import { useExploreUrl } from '../helpers/explore-url';
import { makeLayout } from '../helpers/deep-page';
import { VariantHeader } from '../components/VariantHeader';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React from 'react';
import { MinimalWidgetLayout } from '../components/MinimalWidgetLayout';
import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';

export const DeepChen2021FitnessPage = () => {
  const exploreUrl = useExploreUrl();

  if (!exploreUrl) {
    return null;
  }

  return makeLayout(
    <VariantHeader
      dateRange={exploreUrl.dateRange}
      variant={exploreUrl.variant!}
      controls={
        <Button className='mt-2' variant='secondary' as={Link} to={exploreUrl.getOverviewPageUrl()}>
          Back to overview
        </Button>
      }
      titleSuffix='Relative growth advantage'
    />,
    <Chen2021FitnessWidget.ShareableComponent
      locationSelector={exploreUrl.location}
      variantSelector={exploreUrl.variant!}
      samplingStrategy={exploreUrl.samplingStrategy}
      widgetLayout={MinimalWidgetLayout}
      title='Relative growth advantage'
    />
  );
};
