import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getCountries, getVariants } from '../services/api';

export const MutationLookup = ({ onVariantAndCountrySelect }) => {
  const [variants, setVariants] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('Switzerland');
  const [selectedCountryField, setSelectedCountryField] = useState(['Switzerland']);

  const [selectedMutations, setSelectedMutations] = useState('');
  const [selectedMatchPercentage, setSelectedMatchPercentage] = useState(50);

  const handleCountryFieldChange = selected => {
    let selectedCountry = null;
    if (selected.length === 1) {
      selectedCountry = selected[0];
    }
    // setState({ selectedCountry, selectedCountryField: selected });
    setSelectedCountry(selectedCountry);
    setSelectedCountryField(selected);
  };

  const handleMutationFieldChange = e => {
    setSelectedMutations(e.target.value);
  };

  const handleMatchPercentageFieldChange = e => {
    setSelectedMatchPercentage(e.target.value);
  };

  const handleSearchButtonClick = () => {
    const variant = {
      mutations: selectedMutations.split(',').map(m => m.trim()),
    };
    onVariantAndCountrySelect(
      {
        variant,
        country: selectedCountry,
      },
      selectedMatchPercentage / 100
    );
  };

  useEffect(() => {
    let isSubscribed = true;
    getCountries().then(newCountries => {
      if (isSubscribed) {
        setCountries(newCountries);
      }
    });
    getVariants().then(newVariants => {
      if (isSubscribed) {
        setVariants(newVariants);
      }
    });
    return () => {
      isSubscribed = false;
      // controller.abort();
      console.log('TIME Cleanup render for variant age distribution plot');
    };
  }, []);

  return (
    <>
      {countries && (
        <Form>
          <Form.Group controlId='countryFieldGroup'>
            <Form.Label>Country</Form.Label>
            <Typeahead
              id='countryField'
              selected={selectedCountryField}
              onChange={handleCountryFieldChange}
              options={countries}
            />
          </Form.Group>
          <Form.Group controlId='mutationsFieldGroup'>
            <Form.Label>Mutations (comma-separated and case-sensitive)</Form.Label>
            <Form.Control
              type='text'
              value={selectedMutations}
              placeholder='Example: S:N501Y,ORF1a:G3676-,ORF8:Q27*'
              onChange={handleMutationFieldChange}
            />
          </Form.Group>
          <Form.Group controlId='matchPercentageGroup'>
            <Form.Label>Match Percentage</Form.Label>
            <span style={{ marginLeft: '30px' }}>{selectedMatchPercentage}%</span>
            <Form.Control type='range' onChange={handleMatchPercentageFieldChange} />
          </Form.Group>
          <Button variant='primary' onClick={handleSearchButtonClick}>
            Search
          </Button>
        </Form>
      )}
    </>
  );
};
