import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import { getVariants } from '../services/api';
import { Variant, Country } from '../services/api-types';
import { CountrySelectionForm } from './CountrySelectionForm';

export interface SelectedVariantAndCountry {
  variant: Variant;
  country?: Country;
}

interface Props {
  onVariantAndCountrySelect: (selected: SelectedVariantAndCountry) => void;
}

export const KnownVariantsList = ({ onVariantAndCountrySelect }: Props) => {
  const [variants, setVariants] = useState<Variant[]>();
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>('Switzerland');

  useEffect(() => {
    let isSubscribed = true;
    getVariants().then(countries => {
      if (isSubscribed) {
        setVariants(countries);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleVariantSelect = (variant: Variant) => {
    onVariantAndCountrySelect({
      variant,
      country: selectedCountry,
    });
  };

  return (
    <>
      <CountrySelectionForm onSelect={setSelectedCountry} />
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
