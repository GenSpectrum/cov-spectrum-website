import React, { useMemo } from 'react';
import { formatVariantDisplayName, getPangoLineage, VariantSelector } from '../data/VariantSelector';
import { fetchPangoLineageRecombinant } from '../data/api';
import { usePangoLineageFullName } from '../services/pangoLineageAlias';
import { useQuery } from '../helpers/query-hook';

export interface Props {
  variant: VariantSelector;
  titleSuffix?: React.ReactNode | React.ReactNode[];
  controls?: React.ReactNode | React.ReactNode[];
}

function useLineageDescriptionText(variant: VariantSelector) {
  const lineageAliasText = useAliasText(variant);
  const recombinationText = useRecombinantText(variant);

  return lineageAliasText ?? recombinationText;
}

function useAliasText(variant: VariantSelector) {
  const pangoLineage = getPangoLineage(variant);
  const pangoLineageFullName = usePangoLineageFullName(pangoLineage);
  if (pangoLineageFullName === undefined) {
    return undefined;
  }
  return 'Alias for ' + pangoLineageFullName;
}

function useRecombinantText(variant: VariantSelector) {
  const { data } = useQuery(fetchPangoLineageRecombinant, []);
  return useMemo(() => {
    if (data) {
      const pangoLineage = getPangoLineage(variant);
      const baseLineage = extractBaseLineage(pangoLineage);

      const recombinant = data.find(pangoLineageRecombinant => {
        return pangoLineageRecombinant.name === baseLineage;
      });

      if (recombinant) {
        const recombinantTextPrefix = pangoLineage.startsWith(baseLineage + '.')
          ? 'Child of recombinant of '
          : 'Recombinant of ';
        return recombinantTextPrefix + [...new Set(recombinant.parents)].join(', ');
      }
    }
    return undefined;
  }, [data, variant]);
}

function extractBaseLineage(variantName: String) {
  return variantName.split('.')[0].split('*')[0];
}

export const VariantHeader = ({ variant, titleSuffix, controls }: Props) => {
  const lineageDescriptionText = useLineageDescriptionText(variant);

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
      {lineageDescriptionText && <h3 className=' text-gray-500'>{lineageDescriptionText}</h3>}
    </div>
  );
};
