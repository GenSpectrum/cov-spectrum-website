import React, { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { getVariants } from '../services/api';
import { Country, Variant, Selection } from '../services/api-types';

export interface SelectedVariantAndCountry {
  variant: Variant;
  country?: Country;
}

interface Props {
  country: Country;
  onVariantSelect: (variant: Variant) => void;
  selection: Selection | undefined;
}

export const KnownVariantsList = ({ country, onVariantSelect, selection }: Props) => {
  const [variants, setVariants] = useState<Variant[]>();

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

  if (!variants) {
    return <p>Loading...</p>;
  }

  return (
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
            {selection !== undefined && selection.variant.name === d.name ? (
              <>
                <td>
                  <b>{d.name}</b>
                </td>
                <td></td>
              </>
            ) : (
              <>
                <td>{d.name}</td>
                <td>
                  <Button
                    onClick={() => {
                      onVariantSelect(d);
                    }}
                    variant='outline-secondary'
                    size='sm'
                  >
                    Show Details
                  </Button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
