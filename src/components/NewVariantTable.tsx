import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { getInterestingVariants } from '../services/api';
import { Country, InterestingVariantResult, Variant } from '../services/api-types';
import { BiHelpCircle } from 'react-icons/bi';
import ReactTooltip from 'react-tooltip';
import { NewVariantMutationList } from './NewVariantMutationList';

interface Props {
  country: Country;
  onVariantSelect: (variant: Variant) => void;
}

export const NewVariantTable = ({ country, onVariantSelect }: Props) => {
  const [data, setData] = useState<InterestingVariantResult>();

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
                <th>
                  Mutations{' '}
                  <div
                    style={{ display: 'inline' }}
                    data-for='new-variant-table-mutations-help'
                    data-tip='The mutations in bold are characteristic for the variant.'
                  >
                    <BiHelpCircle />
                  </div>
                  <ReactTooltip id='new-variant-table-mutations-help' />
                </th>
                <th># Sequences in last 3 months</th>
                <th>Est. fitness advantage</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.variants.slice(0, 200).map(v => {
                return (
                  <tr key={v.mutations.map(m => m.mutation).join(', ')}>
                    <td style={{ maxWidth: '400px', lineBreak: 'auto' }}>
                      <NewVariantMutationList mutations={v.mutations} />
                    </td>
                    <td>
                      {v.absoluteNumberSamplesInPastThreeMonths} (
                      {(v.relativeNumberSamplesInPastThreeMonths * 100).toFixed(2)}%)
                    </td>
                    <td>{v.f.toFixed(4)}</td>
                    <td>
                      <Button
                        onClick={() => {
                          onVariantSelect({
                            mutations: v.mutations.map(m => m.mutation),
                          });
                        }}
                        variant='secondary'
                        size='sm'
                      >
                        Show Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};
