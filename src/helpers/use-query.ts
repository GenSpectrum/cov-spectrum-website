import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { QueryEncoder, ZodQueryEncoder } from './query';
import * as zod from 'zod';

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

export function useQueryWithSchema<S extends zod.ZodSchema<any>, T extends zod.output<S>>(
  schema: S | undefined
): T | undefined {
  const encoder = useMemo(() => schema && new ZodQueryEncoder(schema), [schema]);
  return useQueryWithEncoder(encoder);
}
