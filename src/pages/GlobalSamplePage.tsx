import React from 'react';
import { SampleTable } from '../components/SampleTable';
import { VariantHeader } from '../components/VariantHeader';
import { ZodQueryEncoder } from '../helpers/query-encoder';
import { VariantSelector, VariantSelectorSchema } from '../helpers/sample-selector';
import { useQueryWithEncoder } from '../helpers/use-query';

export const queryEncoder = new ZodQueryEncoder(VariantSelectorSchema);

export function getGlobalSamplePageLink(params: VariantSelector): string {
  return `/global-samples?${queryEncoder.encode(params).toString()}`;
}

export const GlobalSamplePage = () => {
  const decodedQuery = useQueryWithEncoder(queryEncoder);

  if (!decodedQuery) {
    return <div>Invalid query parameters</div>;
  }

  const { variant, matchPercentage } = decodedQuery;

  return (
    <>
      <VariantHeader variant={variant} titleSuffix='Worldwide samples' />
      <SampleTable variant={variant} matchPercentage={matchPercentage} />
    </>
  );
};
