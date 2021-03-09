import React from 'react';
import { Variant } from '../services/api-types';
import { MutationList } from './MutationList';

export interface Props {
  variant: Variant;
  titleSuffix?: React.ReactChild | React.ReactChild[];
  controls?: React.ReactChild | React.ReactChild[];
}

export const VariantHeader = ({ variant, titleSuffix, controls }: Props) => {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <h1 style={{ flexGrow: 1 }}>
          {variant.name ?? 'Unnamed Variant'}
          {!!titleSuffix && ' - '}
          {titleSuffix}
        </h1>
        <div>{controls}</div>
      </div>
      <p>
        <b>Mutations:</b> <MutationList mutations={variant.mutations} />
      </p>
    </>
  );
};
