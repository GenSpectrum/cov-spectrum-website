import React, { useEffect, useState } from 'react';
import { PangoLineageAliasResolverService } from '../services/PangoLineageAliasResolverService';
import { getWHOLabel, getWHOVariantType } from '../services/who-label';
import { DateRangePicker } from './DateRangePicker';
import { formatVariantDisplayName, variantIsOnlyDefinedBy, VariantSelector } from '../data/VariantSelector';
import { DateRangeSelector } from '../data/DateRangeSelector';

export interface Props {
  dateRange: DateRangeSelector;
  variant: VariantSelector;
  titleSuffix?: React.ReactChild | React.ReactChild[];
  controls?: React.ReactChild | React.ReactChild[];
}

export const VariantHeader = ({ variant, titleSuffix, controls, dateRange }: Props) => {
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
    <div className='ml-3'>
      <div className='flex'>
        <div className='flex-grow flex flex-row flex-wrap items-end space-x-2'>
          <h1>
            {formatVariantDisplayName(variant)}
            {label && ` (${label})`}
            {!!titleSuffix && ' - '}
            {titleSuffix}
          </h1>
          {<h3 className='pl-1.5 text-gray-500'>{type && ` variant of ${type}`}</h3>}
          {dateRange && <DateRangePicker dateRangeSelector={dateRange} />}
        </div>
        <div>{controls}</div>
      </div>
      {resolvedFullName && <h3 className=' text-gray-500'>Alias for {resolvedFullName}</h3>}
    </div>
  );
};
