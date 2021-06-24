import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { Variant } from '../services/api-types';
import { ButtonVariant, Button } from '../helpers/ui';

interface Props {
  onVariantSelect: (selection: { variant: Variant; matchPercentage: number }) => void;
}

const examples = ['S:501Y', 'S:E484', 'S:D614G', 'S:69-,S:70-', 'ORF1a:S3675', 'orf7b:39*'];

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
    <>
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
            <div className='flex items-end'>
              <Button className='mt-1 ml-2' variant={ButtonVariant.PRIMARY} onClick={() => {}}>
                Search
              </Button>
            </div>
          </div>
        </Form.Group>
      </Form>
      <div>
        <div>Examples:</div>
        <div className='flex flex-wrap list-disc	'>
          {examples.map(e => (
            <div className='w-28 pr-2' key={e}>
              <button
                className='underline outline-none'
                onClick={() =>
                  onVariantSelect({
                    variant: {
                      mutations: e.split(',').map(m => m.trim()),
                    },
                    matchPercentage: 1,
                  })
                }
              >
                {e}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
