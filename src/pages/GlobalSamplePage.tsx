import React, { useMemo } from 'react';
import { SampleTable } from '../components/SampleTable';
import { CountrySchema, Variant } from '../services/api-types';
import { SampleSelectorSchema } from '../helpers/sample-selector';
import { useQueryWithEncoder } from '../helpers/use-query';
import { ZodQueryEncoder } from '../helpers/query-encoder';

const queryEncoder = new ZodQueryEncoder(SampleSelectorSchema.extend({ country: CountrySchema.optional() }));

export type SamplePageQuery = typeof queryEncoder['_decodedType'];

export function getSamplePageLink(params: SamplePageQuery): string {
  return `/global-samples?${queryEncoder.encode(params).toString()}`;
}

export const GlobalSamplePage = () => {
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

  return (
    <>
      <h3>Samples {data.country && 'in ' + data.country}</h3>
      <p>
        <b>Mutations:</b> {variant.mutations.join(', ')}
      </p>
      <SampleTable variant={variant} matchPercentage={data.matchPercentage} country={data.country} />
    </>
  );
};
