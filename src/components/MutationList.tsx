import React from 'react';
import { MutationName } from './MutationName';

interface Props {
  mutations: string[];
}

export const MutationList = ({ mutations }: Props) => {
  return (
    <>
      {mutations
        .map(m => <MutationName key={m} mutation={m} />)
        .flatMap((v, i) => (i === 0 ? [v] : [', ', v]))}
    </>
  );
};
