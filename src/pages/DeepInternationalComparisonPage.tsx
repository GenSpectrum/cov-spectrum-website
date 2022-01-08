import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React from 'react';
import { VariantHeader } from '../components/VariantHeader';
import { useExploreUrl } from '../helpers/explore-url';
import { makeLayout } from '../helpers/deep-page';
import { InternationalComparison } from '../components/InternationalComparison';
import { useQuery } from '../helpers/query-hook';
import { CountryDateCountSampleData } from '../data/sample/CountryDateCountSampleDataset';

export const DeepInternationalComparisonPage = () => {
  const exploreUrl = useExploreUrl();

  const dvsSelector = {
    location: {},
    dateRange: exploreUrl?.dateRange,
    samplingStrategy: exploreUrl?.samplingStrategy!,
    variant: exploreUrl?.variant,
  };
  const dsSelector = {
    location: {},
    dateRange: exploreUrl?.dateRange,
    samplingStrategy: exploreUrl?.samplingStrategy!,
  };
  const variantInternationalDateCount = useQuery(
    signal => CountryDateCountSampleData.fromApi(dvsSelector, signal),
    [dvsSelector]
  );
  const wholeInternationalDateCount = useQuery(
    signal => CountryDateCountSampleData.fromApi(dsSelector, signal),
    [dsSelector]
  );

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
      titleSuffix='International comparison'
    />,
    variantInternationalDateCount.data && wholeInternationalDateCount.data && (
      <InternationalComparison
        locationSelector={exploreUrl.location}
        variantInternationalDateCountDataset={variantInternationalDateCount.data}
        wholeInternationalDateCountDataset={wholeInternationalDateCount.data}
      />
    )
  );
};
