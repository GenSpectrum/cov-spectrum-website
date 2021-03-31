import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { getInterestingVariants } from '../services/api';
import { Country, InterestingVariant, Variant } from '../services/api-types';
import { sortMutationList } from '../helpers/mutation-list';

interface Props {
  country: Country;
  onVariantSelect: (variant: Variant) => void;
}

export const NewVariantTable = ({ country, onVariantSelect }: Props) => {
  const [data, setData] = useState<InterestingVariant[]>();

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getInterestingVariants({ country }, signal).then(newData => {
      if (isSubscribed) {
        setData(newData);
      }
    });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country]);

  return (
    <div>
      {data && (
        <div style={{ height: '400px', overflow: 'auto' }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Mutations</th>
                <th># Sequences in last 3 months</th>
                <th>Est. fitness advantage</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 200).map(d => (
                <tr key={d.variant.mutations.join(',')}>
                  <td style={{ maxWidth: '400px', lineBreak: 'auto' }}>
                    {sortMutationList(d.variant.mutations).join(', ')}
                  </td>
                  <td>
                    {d.absoluteNumberSamplesInPastThreeMonths} (
                    {(d.relativeNumberSamplesInPastThreeMonths * 100).toFixed(2)}%)
                  </td>
                  <td>{d.f.toFixed(4)}</td>
                  <td>
                    <Button
                      onClick={() => {
                        onVariantSelect(d.variant);
                      }}
                      variant='secondary'
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
