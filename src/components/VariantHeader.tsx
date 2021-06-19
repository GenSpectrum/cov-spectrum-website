import React, { useEffect, useState } from 'react';
import { Place, Variant } from '../services/api-types';
import { MutationList } from './MutationList';
import { PangolinLineageAliasResolverService } from '../services/PangolinLineageAliasResolverService';

export interface Props {
  variant: Variant;
  titleSuffix?: React.ReactChild | React.ReactChild[];
  controls?: React.ReactChild | React.ReactChild[];
  place: Place;
}

export const VariantHeader = ({ variant, titleSuffix, controls, place }: Props) => {
  const [resolvedFullName, setResolvedFullName] = useState<string | undefined>();
  useEffect(() => {
    let isSubscribed = true;
    if (variant.name === undefined) {
      setResolvedFullName(undefined);
      return;
    }
    PangolinLineageAliasResolverService.findFullName(variant.name).then(name => {
      if (isSubscribed) {
        setResolvedFullName(name);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, [variant.name]);

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
      {resolvedFullName && <div>Alias for {resolvedFullName}</div>}
      {variant.mutations.length > 0 && (
        <p>
          <b>Mutations:</b> <MutationList mutations={variant.mutations} />
        </p>
      )}
    </div>
  );
};
