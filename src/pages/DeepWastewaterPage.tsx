import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React from 'react';
import { VariantHeader } from '../components/VariantHeader';
import { useExploreUrl } from '../helpers/explore-url';
import { makeLayout } from '../helpers/deep-page';
import { WasteWaterDeepFocus } from '../models/wasteWater/WasteWaterDeepFocus';

export const DeepWastewaterPage = () => {
  const exploreUrl = useExploreUrl();

  if (!exploreUrl) {
    return null;
  }

  return makeLayout(
    <VariantHeader
      dateRange={exploreUrl.dateRange}
      variant={exploreUrl.variants![0]}
      controls={
        <Link to={exploreUrl.getOverviewPageUrl()}>
          <Button className='mt-2' variant='secondary'>
            Back to overview
          </Button>
        </Link>
      }
      titleSuffix='Wastewater prevelance'
    />,
    exploreUrl.location.country === 'Switzerland' ? (
      <WasteWaterDeepFocus
        country={exploreUrl.location.country}
        variantName={exploreUrl.variants![0].pangoLineage?.replace('*', '')}
      />
    ) : (
      <>Nothing to see here.</>
    )
  );
};
