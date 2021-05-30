import React from 'react';
import { Place, Variant } from '../services/api-types';
import { MutationList } from './MutationList';

export interface Props {
  variant: Variant;
  titleSuffix?: React.ReactChild | React.ReactChild[];
  controls?: React.ReactChild | React.ReactChild[];
  place: Place;
}

export const VariantHeader = ({ variant, titleSuffix, controls, place }: Props) => {
  return (
    <div className='ml-3'>
      <div className='flex'>
        <h1 style={{ flexGrow: 1 }}>
          {variant.name ?? 'Unnamed Variant'}
          {!!titleSuffix && ' - '}
          {titleSuffix}
          {' in '}
          {place}
        </h1>
        <div>{controls}</div>
      </div>
      {variant.mutations.length > 0 && (
        <p>
          <b>Mutations:</b> <MutationList mutations={variant.mutations} />
        </p>
      )}
    </div>
  );
};
