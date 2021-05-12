import React from 'react';
import { MutationName } from './MutationName';
import { sortMutationList } from '../helpers/mutation';

interface Props {
  mutations: string[];
}

export const MutationList = ({ mutations }: Props) => {
  return (
    <>
      {sortMutationList(mutations)
        .map(m => <MutationName key={m} mutation={m} />)
        .flatMap((v, i) => (i === 0 ? [v] : [', ', v]))}
    </>
  );
};
