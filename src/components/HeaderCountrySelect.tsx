import React from 'react';
import { useExploreUrl } from '../helpers/explore-url';
import { PlaceSelect } from './PlaceSelect';

export const HeaderCountrySelect = () => {
  const exploreUrl = useExploreUrl();

  if (!exploreUrl) {
    return null;
  }

  return <PlaceSelect selected={exploreUrl.location} onSelect={exploreUrl.setLocation} />;
};
