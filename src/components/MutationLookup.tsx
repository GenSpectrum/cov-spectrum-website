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
        <Form.Label>Mutations (comma-separated)</Form.Label>
        <Form.Control
          type='text'
          value={selectedMutations}
          placeholder='Example: S:N501Y,ORF1a:G3676-,ORF8:Q27*'
          onChange={ev => setSelectedMutations(ev.target.value)}
        />
      </Form.Group>
      <Form.Group controlId='matchPercentageGroup'>
        <div id='range-with-title' className='flex flex-row '>
          <div className='flex flex-col flex-grow mr-5 md:mr-10'>
            <span className=''>Match Percentage: {selectedMatchPercentage}%</span>
            <Form.Control
              type='range'
              value={selectedMatchPercentage}
              onChange={ev => setSelectedMatchPercentage(+ev.target.value)}
            />
          </div>
          <Button type='submit' variant='primary'>
            Search
          </Button>
        </div>
      </Form.Group>
    </Form>
  );
};
