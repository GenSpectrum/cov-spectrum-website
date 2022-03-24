import React, { useEffect, useState } from 'react';
import { PangoLineageAliasResolverService } from '../services/PangoLineageAliasResolverService';
import { getWHOLabel, getWHOVariantType } from '../services/who-label';
import { formatVariantDisplayName, variantIsOnlyDefinedBy, VariantSelector } from '../data/VariantSelector';
import { DateRangeSelector } from '../data/DateRangeSelector';

export interface Props {
  dateRange: DateRangeSelector;
  variant: VariantSelector;
  titleSuffix?: React.ReactChild | React.ReactChild[];
  controls?: React.ReactChild | React.ReactChild[];
}

export const VariantHeader = ({ variant, titleSuffix, controls }: Props) => {
  const [resolvedFullName, setResolvedFullName] = useState<string | undefined>();

  const label = variantIsOnlyDefinedBy(variant, 'pangoLineage')
    ? getWHOLabel(variant.pangoLineage!)
    : undefined;
  const type = variantIsOnlyDefinedBy(variant, 'pangoLineage')
    ? getWHOVariantType(variant.pangoLineage!)
    : undefined;

  useEffect(() => {
    let isSubscribed = true;
    if (variant.pangoLineage === undefined) {
      setResolvedFullName(undefined);
      return;
    }
    PangoLineageAliasResolverService.findFullName(variant.pangoLineage).then(name => {
      if (isSubscribed) {
        setResolvedFullName(name);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, [variant.pangoLineage]);

  return (
    <div className='pt-10 lg:pt-0 ml-1 md:ml-3 w-full relative'>
      <div className='absolute top-0 right-0 md:right-4'>{controls}</div>
      <div className='flex'>
        <div className='flex-grow flex flex-row flex-wrap items-end'>
          <h1 className='md:mr-2'>
            {formatVariantDisplayName(variant)}
            {label && ` (${label})`}
            {!!titleSuffix && ' - '}
            {titleSuffix}
          </h1>
          {type && <h3 className='text-gray-500 sm:mr-2'>{`variant of ${type}`}</h3>}
        </div>
      </div>
      {resolvedFullName && <h3 className=' text-gray-500'>Alias for {resolvedFullName}</h3>}
    </div>
  );
};
