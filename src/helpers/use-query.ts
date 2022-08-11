import { useMemo } from 'react';
import { AsyncState, PromiseFn, useAsync } from 'react-async';
import { useLocation } from 'react-router-dom';
import { AsyncQueryEncoder, QueryEncoder } from './query-encoder';

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

export function useQueryWithAsyncEncoder<T>(encoder: AsyncQueryEncoder<T> | undefined): AsyncState<T> {
  const location = useLocation();
  const promiseFn = useMemo<PromiseFn<T>>(
    () =>
      (options, { signal }) => {
        if (!encoder) {
          throw new Error('no encoder specified');
        }
        return encoder.decode(new URLSearchParams(location.search), signal);
      },
    [location.search, encoder]
  );
  return useAsync(promiseFn);
}
