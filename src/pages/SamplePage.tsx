import React from 'react';
import { useLocation } from 'react-router-dom';
import { SampleTable } from '../components/SampleTable';

import { DataDistributionConfiguration, Variant } from '../helpers/types';

function useQuery() {
  console.log('location is ', useLocation());
  return new URLSearchParams(useLocation().search);
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

  const variant: Variant = {
    mutations: data.mutations ?? [],
    name: '',
  };

  return (
    <div>
      {}
      <SampleTable variant={variant} matchPercentage={data.matchPercentage} country={data.country} />
    </div>
  );
}
