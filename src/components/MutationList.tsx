import React from 'react';
import { MutationName } from './MutationName';

interface Props {
  mutations: string[];
}

export const MutationList = ({ mutations }: Props) => {
  return (
    <>
      {mutations
        .map<React.ReactNode>(m => <MutationName key={m} mutation={m} />)
        .reduce((prev, curr) => [prev, ', ', curr])}
    </>
  );
};
