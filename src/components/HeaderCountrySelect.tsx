import React from 'react';
import { useExploreUrl } from '../helpers/explore-url';
import { RequiredPlaceSelect } from './RequiredPlaceSelect';

export const HeaderCountrySelect = () => {
  const exploreUrl = useExploreUrl();

  if (!exploreUrl) {
    return null;
  }

  return (
    <div>
      <RequiredPlaceSelect
        id='countrySelect'
        selected={exploreUrl.location}
        onSelect={exploreUrl.setLocation}
      />
    </div>
  );
};
