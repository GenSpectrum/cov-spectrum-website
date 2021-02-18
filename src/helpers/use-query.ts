import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { QueryEncoder } from './query-encoder';

export function useQueryWithEncoder<T>(encoder: QueryEncoder<T> | undefined): T | undefined {
  const location = useLocation();
  return useMemo(() => {
    try {
      return encoder?.decode(new URLSearchParams(location.search));
    } catch (err) {
      console.error('failed to decode query', err);
    }
  }, [location.search, encoder]);
}
