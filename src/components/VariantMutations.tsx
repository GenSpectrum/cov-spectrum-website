import React, { useState } from 'react';
import styled from 'styled-components';
import { MutationName } from './MutationName';
import { sortListByAAMutation } from '../helpers/aa-mutation';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { MutationProportionDataset } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { useQuery } from '../helpers/query-hook';

export interface Props {
  selector: LocationDateVariantSelector;
}

const MutationList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const MutationEntry = styled.li`
  width: 250px;
`;

export const VariantMutations = ({ selector }: Props) => {
  const [commonMutationsSort, setCommonMutationsSort] = useState<'proportion' | 'position'>('position');
  const [commonNucMutationsSort, setCommonNucMutationsSort] = useState<'proportion' | 'position'>('position');

  const data = useQuery(
    signal =>
      Promise.all([
        MutationProportionDataset.fromApi(selector, 'aa', signal),
        MutationProportionDataset.fromApi(selector, 'nuc', signal),
      ]).then(([aaMutationDataset, nucMutationDataset]) => ({
        aa: aaMutationDataset.getPayload(),
        nuc: nucMutationDataset.getPayload(),
      })),
    [selector]
  );

  if (data.isLoading || !data.data) {
    return <Loader />;
  }

  return (
    <>
      <div>
        The following (amino acid) mutations are present in at least 5% of the sequences of this variant:
      </div>
      <div className='ml-4'>
        <span
          className={commonMutationsSort === 'proportion' ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setCommonMutationsSort('proportion')}
        >
          Sort by proportion
        </span>{' '}
        |{' '}
        <span
          className={commonMutationsSort === 'position' ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setCommonMutationsSort('position')}
        >
          Sort by position
        </span>
      </div>
      <MutationList className='list-disc'>
        {(commonMutationsSort === 'proportion'
          ? data.data.aa.sort((a, b) => b.proportion - a.proportion)
          : sortListByAAMutation(data.data.aa, x => x.mutation)
        ).map(({ mutation, proportion }) => {
          return (
            <MutationEntry key={mutation}>
              <MutationName mutation={mutation} /> ({(proportion * 100).toFixed(2)}%)
            </MutationEntry>
          );
        })}
      </MutationList>
      <div className='mt-4'>
        The following nucleotide mutations are present in at least 5% of the sequences of this variant
        (leading and tailing deletions are excluded):
      </div>
      <div className='ml-4'>
        <span
          className={commonNucMutationsSort === 'proportion' ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setCommonNucMutationsSort('proportion')}
        >
          Sort by proportion
        </span>{' '}
        |{' '}
        <span
          className={commonNucMutationsSort === 'position' ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setCommonNucMutationsSort('position')}
        >
          Sort by position
        </span>
      </div>
      <MutationList className='list-disc'>
        {data.data.nuc
          .sort((a, b) => {
            if (commonNucMutationsSort === 'proportion') {
              return b.proportion - a.proportion;
            } else {
              return (
                parseInt(a.mutation.substr(1, a.mutation.length - 2)) -
                parseInt(b.mutation.substr(1, b.mutation.length - 2))
              );
            }
          })
          .map(({ mutation, proportion }) => {
            return (
              <MutationEntry key={mutation}>
                {mutation} ({(proportion * 100).toFixed(2)}%)
              </MutationEntry>
            );
          })}
      </MutationList>
    </>
  );
};
