import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getVariants, getCountries } from '../services/api';

// export class KnownVariantsList extends React.Component {
export const KnownVariantsList = ({ onVariantAndCountrySelect }) => {
  const [countries, setCountries] = useState(null);
  const [variants, setVariants] = useState(null);

  const [selectedCountry, setSelectedCountry] = useState('Switzerland');
  const [selectedCountryField, setSelectedCountryField] = useState(['Switzerland']);

  useEffect(() => {
    let isSubscribed = true;
    getCountries().then(countries => {
      if (isSubscribed) {
        console.log('Countries are', countries);
        setCountries(countries);
      }
    });
    getVariants().then(countries => {
      if (isSubscribed) {
        console.log('Countries are', countries);
        setVariants(countries);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleVariantSelect = variant => {
    onVariantAndCountrySelect({
      variant,
      country: selectedCountry,
    });
  };

  const handleCountryChange = selected => {
    let selectedCountry = null;
    if (selected.length === 1) {
      selectedCountry = selected[0];
    }
    setSelectedCountry(selectedCountry);
    setSelectedCountryField(selectedCountryField);
  };

  return (
    <>
      {countries && (
        <Form>
          <Form.Group controlId='countryFieldGroup'>
            <Form.Label>Country</Form.Label>
            <Typeahead
              id='countryField'
              selected={selectedCountryField}
              onChange={handleCountryChange}
              options={countries}
            />
          </Form.Group>
        </Form>
      )}
      {variants ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Variant</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {variants.map(d => (
              <tr key={d.name}>
                <td>{d.name}</td>
                <td>
                  <Button
                    onClick={() => {
                      handleVariantSelect(d);
                    }}
                    variant='outline-secondary'
                    size='sm'
                  >
                    Show Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};
