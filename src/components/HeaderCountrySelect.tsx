import React from 'react';
import { Form } from 'react-bootstrap';
import { useExploreUrl } from '../helpers/explore-url';
import { RequiredPlaceSelect } from './RequiredPlaceSelect';

export const HeaderCountrySelect = () => {
  const exploreUrl = useExploreUrl();

  if (!exploreUrl) {
    return null;
  }

  return (
    <Form inline className='mr-3'>
      <RequiredPlaceSelect
        id='countrySelect'
        selected={exploreUrl.country}
        onSelect={exploreUrl.setCountry}
      />
    </Form>
  );
};
