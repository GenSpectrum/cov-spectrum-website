import { DependencyList, EffectCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';

// Thanks https://stackoverflow.com/a/54096391/8376759
function useDeepCompareMemoize<T>(value: T): T | undefined {
  const ref = useRef<T>();
  if (!_.isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

export function useDeepCompareEffect(callback: EffectCallback, dependencies: DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

export function useDeepCompareMemo<T>(factory: () => T, deps: DependencyList): T {
  const [value, setValue] = useState<T>(factory());
  useDeepCompareEffect(() => {
    setValue(factory());
  }, deps);
  return value;
}
