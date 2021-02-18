import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { Country, Variant } from '../services/api-types';
import { CountrySelect } from './CountrySelect';

export interface SelectedVariantAndCountry {
  variant: Variant;
  country?: Country;
}

interface Props {
  onVariantAndCountrySelect: (selected: SelectedVariantAndCountry, matchRatio: number) => void;
}

export const MutationLookup = ({ onVariantAndCountrySelect }: Props) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>('Switzerland');
  const [selectedMutations, setSelectedMutations] = useState('');
  const [selectedMatchPercentage, setSelectedMatchPercentage] = useState(50);

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

  return (
    <Form>
      <Form.Group controlId='countryFieldGroup'>
        <Form.Label>Country</Form.Label>
        <CountrySelect id='countryFieldGroup' selected={selectedCountry} onSelect={setSelectedCountry} />
      </Form.Group>
      <Form.Group controlId='mutationsFieldGroup'>
        <Form.Label>Mutations (comma-separated and case-sensitive)</Form.Label>
        <Form.Control
          type='text'
          value={selectedMutations}
          placeholder='Example: S:N501Y,ORF1a:G3676-,ORF8:Q27*'
          onChange={ev => setSelectedMutations(ev.target.value)}
        />
      </Form.Group>
      <Form.Group controlId='matchPercentageGroup'>
        <Form.Label>Match Percentage</Form.Label>
        <span style={{ marginLeft: '30px' }}>{selectedMatchPercentage}%</span>
        <Form.Control type='range' onChange={ev => setSelectedMatchPercentage(+ev.target.value)} />
      </Form.Group>
      <Button variant='primary' onClick={handleSearchButtonClick}>
        Search
      </Button>
    </Form>
  );
};
