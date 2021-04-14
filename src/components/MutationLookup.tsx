import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { Variant } from '../services/api-types';

interface Props {
  onVariantSelect: (selection: { variant: Variant; matchPercentage: number }) => void;
}

export const MutationLookup = ({ onVariantSelect }: Props) => {
  const [selectedMutations, setSelectedMutations] = useState('');
  const [selectedMatchPercentage, setSelectedMatchPercentage] = useState(100);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const variant = {
      mutations: selectedMutations.split(',').map(m => m.trim()),
    };
    onVariantSelect({
      variant,
      matchPercentage: selectedMatchPercentage / 100,
    });
  };

  return (
    <Form onSubmit={onSubmit}>
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
        <Form.Label>Match percentage</Form.Label>
        <span style={{ marginLeft: '30px' }}>{selectedMatchPercentage}%</span>
        <Form.Control
          type='range'
          value={selectedMatchPercentage}
          onChange={ev => setSelectedMatchPercentage(+ev.target.value)}
        />
      </Form.Group>
      <Button type='submit' variant='primary'>
        Search
      </Button>
    </Form>
  );
};
