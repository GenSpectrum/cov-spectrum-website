import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { getInterestingVariants } from '../services/api';
import { Country, InterestingVariantResult, Variant } from '../services/api-types';
import { BiHelpCircle } from 'react-icons/bi';
import ReactTooltip from 'react-tooltip';
import { NewVariantMutationList } from './NewVariantMutationList';
import styled from 'styled-components';
import { sortMutationList } from '../helpers/mutation-list';

// We consider mutations with a uniquenessScore of at least the following value as characteristic/important for a
// variant.
export const UNIQUENESS_SCORE_IMPORTANCE_THRESHOLD = 0.5;

interface Props {
  country: Country;
  onVariantSelect: (variant: Variant) => void;
}

const FilterBar = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
`;

export const NewVariantTable = ({ country, onVariantSelect }: Props) => {
  const [data, setData] = useState<InterestingVariantResult>();
  const [geneFilter, setGeneFilter] = useState<string>('-');
  const [characteristicMutationsFilter, setCharacteristicMutationsFilter] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getInterestingVariants({ country }, signal).then(newData => {
      if (isSubscribed) {
        console.log("new interesting variant ");
        console.log(newData)
        setData(newData);
      }
    });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country]);

  const variants = useMemo(() => {
    const uniqueVisibleMutations = new Set();
    return data?.variants
      .map(v => {
        const visibleMutations = v.mutations.filter(m => {
          if (geneFilter !== '-' && !m.mutation.startsWith(geneFilter + ':')) {
            return false;
          }
          if (characteristicMutationsFilter && m.uniquenessScore < UNIQUENESS_SCORE_IMPORTANCE_THRESHOLD) {
            return false;
          }
          return true;
        });
        return {
          ...v,
          visibleMutations,
          visibleMutationsString: sortMutationList(visibleMutations.map(m => m.mutation)).join(','),
        };
      })
      .filter(v => v.visibleMutations.length > 0)
      .filter(v => {
        // We don't want duplicates and will only show unique visible mutations. The variant with the highest estimated
        // fitness advantage (i.e. on the top of the list) should be kept.
        if (uniqueVisibleMutations.has(v.visibleMutationsString)) {
          return false;
        }
        uniqueVisibleMutations.add(v.visibleMutationsString);
        return true;
      })
      .slice(0, 200);
  }, [data, geneFilter, characteristicMutationsFilter]);

  return (
    <div>
      {data && (
        <>
          <FilterBar>
            <Form.Control
              as='select'
              custom
              style={{ width: '200px', marginRight: '20px' }}
              onChange={e => setGeneFilter(e.target.value)}
            >
              <option value={'-'}>Filter gene</option>
              <option value={'S'}>S</option>
              <option value={'N'}>N</option>
              <option value={'M'}>M</option>
              <option value={'E'}>E</option>
              <option value={'ORF1a'}>ORF1a</option>
              <option value={'ORF1b'}>ORF1b</option>
              <option value={'ORF3a'}>ORF3a</option>
              <option value={'ORF6'}>ORF6</option>
              <option value={'ORF7a'}>ORF7a</option>
              <option value={'ORF7b'}>ORF7b</option>
              <option value={'ORF8'}>ORF8</option>
              <option value={'ORF9b'}>ORF9b</option>
            </Form.Control>
            <Form.Check
              type='checkbox'
              label='Characteristic mutations only'
              onChange={e => setCharacteristicMutationsFilter(e.target.checked)}
            />
          </FilterBar>
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
                {variants?.map((v: any) => {
                  console.log(v);
                  return (
                    <tr key={v.mutations.map((m: any) => m.mutation).join(', ')}>
                      <td style={{ maxWidth: '400px', lineBreak: 'auto' }}>
                        <NewVariantMutationList mutations={v.visibleMutations} />
                      </td>
                      <td>
                        {v.absoluteNumberSamplesInPastThreeMonths} (
                        {(v.relativeNumberSamplesInPastThreeMonths * 100).toFixed(2)}%)
                      </td>
                      <td>
                        {v.f.value.toFixed(4)}
                        <br />[{v.f.ciLower.toFixed(2)}, {v.f.ciUpper.toFixed(2)}]
                      </td>
                      <td>
                        <Button
                          onClick={() => {
                            onVariantSelect({
                              mutations: v.mutations.map((m: any) => m.mutation),
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
        </>
      )}
    </div>
  );
};
