import React, { useMemo } from 'react';
import { SampleTable } from '../components/SampleTable';
import { Variant } from '../services/api-types';
import { useQuerySafe } from '../helpers/use-query';
import { sampleSelectorEncoder } from '../helpers/sample-selector';

export function SamplePage() {
  const data = useQuerySafe(sampleSelectorEncoder);

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
    <div>
      <SampleTable variant={variant} matchPercentage={data.matchPercentage} country={data.country} />
    </div>
  );
}
