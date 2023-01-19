import React, { useEffect, useState } from 'react';
import { PangoLineageAliasResolverService } from '../services/PangoLineageAliasResolverService';
import { formatVariantDisplayName, VariantSelector } from '../data/VariantSelector';
import { DateRangeSelector } from '../data/DateRangeSelector';

export interface Props {
  dateRange: DateRangeSelector;
  variant: VariantSelector;
  titleSuffix?: React.ReactNode | React.ReactNode[];
  controls?: React.ReactNode | React.ReactNode[];
}

export const VariantHeader = ({ variant, titleSuffix, controls }: Props) => {
  const [resolvedFullName, setResolvedFullName] = useState<string | undefined>();

  useEffect(() => {
    let isSubscribed = true;
    if (variant.pangoLineage === undefined && variant.nextcladePangoLineage === undefined) {
      setResolvedFullName(undefined);
      return;
    }
    const pangoLineage: string = variant.pangoLineage
      ? variant.pangoLineage
      : variant.nextcladePangoLineage
      ? variant.nextcladePangoLineage
      : '';
    PangoLineageAliasResolverService.findFullName(pangoLineage).then(name => {
      if (isSubscribed) {
        setResolvedFullName(name);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, [variant.pangoLineage, variant.nextcladePangoLineage]);

  return (
    <div className='pt-10 lg:pt-0 ml-1 md:ml-3 w-full relative'>
      <div className='absolute top-0 right-0 md:right-4'>{controls}</div>
      <div className='flex'>
        <div className='flex-grow flex flex-row flex-wrap items-end'>
          <h1 className='md:mr-2'>
            {formatVariantDisplayName(variant)}
            {!!titleSuffix && ' - '}
            {titleSuffix}
          </h1>
        </div>
      </div>
      {resolvedFullName && <h3 className=' text-gray-500'>Alias for {resolvedFullName}</h3>}
    </div>
  );
};
