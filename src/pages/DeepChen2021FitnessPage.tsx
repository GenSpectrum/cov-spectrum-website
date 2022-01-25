import { useExploreUrl } from '../helpers/explore-url';
import { makeLayout } from '../helpers/deep-page';
import { VariantHeader } from '../components/VariantHeader';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React from 'react';
import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { useSingleSelectorsFromExploreUrl } from '../helpers/selectors-from-explore-url-hook';
import Loader from '../components/Loader';

export const DeepChen2021FitnessPage = () => {
  const exploreUrl = useExploreUrl();

  const { ldvsSelector, ldsSelector } = useSingleSelectorsFromExploreUrl(exploreUrl!);
  const variantDateCount = useQuery(signal => DateCountSampleData.fromApi(ldvsSelector, signal), [
    ldvsSelector,
  ]);
  const wholeDateCount = useQuery(signal => DateCountSampleData.fromApi(ldsSelector, signal), [ldsSelector]);

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
    variantDateCount.data && wholeDateCount.data ? (
      <Chen2021FitnessWidget.ShareableComponent title='Relative growth advantage' selector={ldvsSelector} />
    ) : (
      <Loader />
    )
  );
};
