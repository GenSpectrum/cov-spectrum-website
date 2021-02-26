import React, { useMemo } from 'react';
import { SampleTable } from '../components/SampleTable';
import { CountrySchema, Variant } from '../services/api-types';
import { SampleSelectorSchema } from '../helpers/sample-selector';
import { useQueryWithEncoder } from '../helpers/use-query';
import { ZodQueryEncoder } from '../helpers/query-encoder';

const queryEncoder = new ZodQueryEncoder(SampleSelectorSchema.extend({ country: CountrySchema.optional() }));

export function getSamplePageLink(params: typeof queryEncoder['_decodedType']): string {
  return `/sample?${queryEncoder.encode(params).toString()}`;
}

export function SamplePage() {
  const data = useQueryWithEncoder(queryEncoder);

  const variant: Variant | undefined = useMemo(
    () =>
      data && {
        mutations: data.mutations,
        name: '',
      },
    [data]
  );

  if (!data || !variant) {
    return <div>Invalid query parameters</div>;
  }

  return <SampleTable variant={variant} matchPercentage={data.matchPercentage} country={data.country} />;
}
