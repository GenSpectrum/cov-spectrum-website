import React from 'react';
import { useLocation } from 'react-router-dom';
import { SampleTable } from '../components/SampleTable';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function SamplePage() {
  const query = useQuery();
  const data = {
    mutations: query.get('mutations').split(','),
    matchPercentage: query.get('matchPercentage'),
    country: query.get('country'),
  };

  const variant = {
    mutations: data.mutations,
  };

  return (
    <div>
      <SampleTable variant={variant} matchPercentage={data.matchPercentage} country={data.country} />
    </div>
  );
}
