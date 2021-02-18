import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import { getGrowingVariants } from '../services/api';
import { Country, GrowingVariant, Variant } from '../services/api-types';

interface Props {
  country: Country;
  year: number;
  week: number;
  onVariantSelect: (variant: Variant) => void;
}

export const NewVariantTable = ({ country, year, week, onVariantSelect }: Props) => {
  const [data, setData] = useState<GrowingVariant[]>();

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getGrowingVariants(year, week, country, signal).then(newData => {
      if (isSubscribed) {
        setData(newData);
      }
    });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, year, week, onVariantSelect]);

  return (
    <div>
      {data && (
        <div style={{ height: '400px', overflow: 'auto' }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Mutations</th>
                <th># Sequences</th>
                <th>Proportion</th>
                <th>Relative Increase</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d.variant.mutations.join(',')}>
                  <td style={{ maxWidth: '400px', lineBreak: 'auto' }}>{d.variant.mutations.join(', ')}</td>
                  <td>{d.t1Count}</td>
                  <td>
                    {d.t1Proportion.toFixed(4)} (+
                    {d.absoluteDifferenceProportion.toFixed(4)})
                  </td>
                  <td>{d.relativeDifferenceProportion?.toFixed(4)}</td>
                  <td>
                    <Button
                      onClick={() => {
                        onVariantSelect(d.variant);
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
        </div>
      )}
    </div>
  );
};
