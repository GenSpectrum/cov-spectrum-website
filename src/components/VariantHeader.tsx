import React from 'react';
import { Variant } from '../services/api-types';

export interface Props {
  variant: Variant;
  controls?: React.ReactChild | React.ReactChild[];
}

export const VariantHeader = ({ variant, controls }: Props) => {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <h1 style={{ flexGrow: 1 }}>{variant.name ?? 'Unnamed Variant'}</h1>
        <div>{controls}</div>
      </div>
      <p>
        <b>Mutations:</b> {variant.mutations.join(', ')}
      </p>
    </>
  );
};
