import React from 'react';
import { Form } from 'react-bootstrap';
import { useExploreUrl } from '../helpers/explore-url';
import { RequiredCountrySelect } from './RequiredCountrySelect';

export const HeaderCountrySelect = () => {
  const exploreUrl = useExploreUrl();

  if (!exploreUrl) {
    return null;
  }

  return (
    <Form inline className='mr-3'>
      <Form.Label htmlFor='countrySelect' className='mr-2'>
        Country
      </Form.Label>
      <RequiredCountrySelect
        id='countrySelect'
        selected={exploreUrl.country}
        onSelect={exploreUrl.setCountry}
      />
    </Form>
  );
};
