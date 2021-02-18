import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SampleTable } from '../components/SampleTable';

import { Variant } from '../services/api-types';

function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

//todo convert to actual data types
interface DataLocal {
  mutations: any;
  matchPercentage: any;
  country: any;
}

export function SamplePage() {
  const query = useQuery();

  const data: DataLocal = {
    mutations: query.get('mutations')!.split(','),
    matchPercentage: query.get('matchPercentage'),
    country: query.get('country'),
  };

  const variant: Variant = useMemo(
    () => ({
      mutations: data.mutations ?? [],
      name: '',
    }),
    [data.mutations]
  );

  return (
    <div>
      {}
      <SampleTable variant={variant} matchPercentage={data.matchPercentage} country={data.country} />
    </div>
  );
}
