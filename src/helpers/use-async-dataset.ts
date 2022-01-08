import { PromiseFn, useAsync } from 'react-async';
import { Dataset } from '../data/Dataset';
import { AsyncDataset } from '../data/AsyncDataset';
import { useDeepCompareMemo } from './deep-compare-hooks';
import { useMemo } from 'react';

/**
 * This hook returns an AsyncDataset and updates it when the selector changes. It does not watch for changes of the
 * promiseFn.
 */
export function useAsyncDataset<Selector, Payload>(
  selector: Selector,
  promiseFn: PromiseFn<Dataset<Selector, Payload>>
): AsyncDataset<Selector, Payload> {
  const { memorizedPromiseFn, memorizedSelector } = useDeepCompareMemo(
    () => ({
      memorizedSelector: selector,
      memorizedPromiseFn: promiseFn,
    }),
    [selector]
  );
  const caseCountDatasetAsync = useAsync(memorizedPromiseFn, { selector });
  return useMemo(
    () => ({
      selector: memorizedSelector,
      payload: caseCountDatasetAsync.data?.payload,
      status: caseCountDatasetAsync.status,
    }),
    [caseCountDatasetAsync, memorizedSelector]
  );
}
