import { useExploreUrl } from '../helpers/explore-url';
import { useQuery } from '../helpers/query-hook';
import { makeLayout } from '../helpers/deep-page';
import { VariantHeader } from '../components/VariantHeader';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React from 'react';
import { HospitalizationDeathDeepFocus } from '../components/HospitalizationDeathDeepFocus';
import { formatVariantDisplayName } from '../data/VariantSelector';
import { HospDiedAgeSampleData } from '../data/sample/HospDiedAgeSampleDataset';
import { useSingleSelectorsFromExploreUrl } from '../helpers/selectors-from-explore-url-hook';

export const DeepHospitalizationDeathPage = () => {
  const exploreUrl = useExploreUrl();

  const { ldvsSelector, ldsSelector } = useSingleSelectorsFromExploreUrl(exploreUrl!);
  const variantHospDeathAgeCount = useQuery(signal => HospDiedAgeSampleData.fromApi(ldvsSelector, signal), [
    ldvsSelector,
  ]);
  const wholeHospDeathAgeCount = useQuery(signal => HospDiedAgeSampleData.fromApi(ldsSelector, signal), [
    ldsSelector,
  ]);

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
      titleSuffix='Hospitalization and death'
    />,
    variantHospDeathAgeCount.data && wholeHospDeathAgeCount.data && (
      <HospitalizationDeathDeepFocus
        variantName={formatVariantDisplayName(exploreUrl.variant!, true)}
        variantSampleSet={variantHospDeathAgeCount.data}
        wholeSampleSet={wholeHospDeathAgeCount.data}
      />
    )
  );
};
