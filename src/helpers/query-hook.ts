import { DependencyList, useState } from 'react';
import { useDeepCompareEffect } from './deep-compare-hooks';

export type QueryStatus<T> = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: T | undefined;
  error: any;
};

export function useQuery<T>(
  queryFunction: (signal: AbortSignal) => Promise<T>,
  dependencies: DependencyList,
  useEffectFunction = useDeepCompareEffect
): QueryStatus<T> {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);

  useEffectFunction(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);
    setData(undefined);
    setError(undefined);
    queryFunction(signal)
      .then(_data => {
        if (!isSubscribed) {
          return;
        }
        setIsLoading(false);
        setData(_data);
        setIsSuccess(true);
      })
      .catch(_error => {
        if (!isSubscribed) {
          return;
        }
        setIsLoading(false);
        setError(_error);
        setIsError(true);
      });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { isLoading, isSuccess, isError, data, error };
}
