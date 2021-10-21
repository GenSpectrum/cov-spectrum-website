import React from 'react';
import { MutationName } from './MutationName';
import { sortAAMutationList } from '../helpers/aa-mutation';

interface Props {
  mutations: string[];
}

// This component is currently dead but because it seems potentially quite useful, it has not been removed it.
export const MutationList = ({ mutations }: Props) => {
  return (
    <>
      {sortAAMutationList(mutations)
        .map(m => <MutationName key={m} mutation={m} />)
        .flatMap((v, i) => (i === 0 ? [v] : [', ', v]))}
    </>
  );
};
