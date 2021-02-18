import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getCountries } from '../services/api';
import { Country } from '../services/api-types';

interface Props {
  onSelect: (country: Country | undefined) => void;
}

export const CountryFormGroup = ({ onSelect }: Props) => {
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    getCountries().then(countries => {
      if (isSubscribed) {
        setCountries(countries);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
    <Form.Group controlId='countryFieldGroup'>
      <Form.Label>Country</Form.Label>
      <Typeahead
        id='countryField'
        placeholder='Select a country'
        onChange={selected => onSelect(selected.length === 1 ? selected[0] : undefined)}
        options={countries}
      />
    </Form.Group>
  );
};
