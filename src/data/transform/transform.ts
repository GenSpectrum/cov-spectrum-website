import { calculateWilsonInterval } from '../../helpers/wilson-interval';

export class SingleData<E> {
  constructor(public data: E[]) {}

  filter(predicate: (e: E) => boolean): SingleData<E> {
    return new SingleData(this.data.filter(predicate));
  }

  sort(compareFn?: (a: E, b: E) => number) {
    return new SingleData([...this.data].sort(compareFn));
  }

  map<S>(callbackfn: (value: E, index: number, array: E[]) => S) {
    return new SingleData(this.data.map(callbackfn));
  }

  groupBy<K>(getKey: (e: E) => K): GroupedData<E, K> {
    const map = new Map<K, E[]>();
    for (const d of this.data) {
      const key = getKey(d);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(d);
    }
    const map2 = new Map<K, SingleData<E>>();
    map.forEach((v, k) => map2.set(k, new SingleData<E>(v)));
    return new GroupedData<E, K>(map2);
  }

  fill<S>(getKey: (e: E) => S, allRequiredKeys: S[], filler: (key: S) => E): SingleData<E> {
    const allRequiredKeysSet = new Set(allRequiredKeys);
    for (const d of this.data) {
      allRequiredKeysSet.delete(getKey(d));
    }
    const newData = [...this.data];
    for (const key of allRequiredKeysSet) {
      newData.push(filler(key));
    }
    return new SingleData<E>(newData);
  }

  /**
   * This function expects that the data is already sorted in the desired way.
   */
  rolling<S>(n: number, windowFn: (entries: E[]) => S): SingleData<S> {
    if (this.data.length < n) {
      return new SingleData<S>([]);
    }
    const newData: S[] = [];
    for (let i = 0; i <= this.data.length - n; i++) {
      const subset: E[] = [];
      for (let j = 0; j < n; j++) {
        subset.push(this.data[i + j]);
      }
      newData.push(windowFn(subset));
    }
    return new SingleData<S>(newData);
  }

  divideBy<S>(
    denominator: SingleData<E>,
    getKey: (e: E) => S,
    getCount: (e: E) => number
  ): SingleData<E & ProportionValues> {
    const denominatorMap = new Map<S, number>();
    for (const d of denominator.data) {
      denominatorMap.set(getKey(d), getCount(d));
    }
    return new SingleData(
      this.data.map(e => {
        const k = getCount(e);
        const n = denominatorMap.get(getKey(e)) ?? 0;
        const [proportionCILow, proportionCIHigh] = calculateWilsonInterval(k, n);
        return {
          ...e,
          proportion: getCount(e) / (denominatorMap.get(getKey(e)) ?? 0),
          proportionCILow,
          proportionCIHigh,
        };
      })
    );
  }
}

export class GroupedData<E, K> {
  constructor(public data: Map<K, SingleData<E>>) {}

  mapEachGroup<S>(func: (e: SingleData<E>, key: K) => SingleData<S>) {
    const newData = new Map<K, SingleData<S>>();
    this.data.forEach((e, k) => {
      newData.set(k, func(e, k));
    });
    return new GroupedData<S, K>(newData);
  }

  filter(predicate: (e: E) => boolean): GroupedData<E, K> {
    return this.mapEachGroup(e => e.filter(predicate));
  }

  sort(compareFn?: (a: E, b: E) => number) {
    return this.mapEachGroup(e => e.sort(compareFn));
  }

  map<S>(callbackfn: (value: E, index: number, array: E[]) => S) {
    return this.mapEachGroup(e => e.map(callbackfn));
  }

  fill<S>(getKey: (e: E) => S, allRequiredKeys: S[], filler: (key: S, group: K) => E): GroupedData<E, K> {
    return this.mapEachGroup((e, k) => e.fill(getKey, allRequiredKeys, (key: S) => filler(key, k)));
  }

  rolling<S>(n: number, windowFn: (entries: E[]) => S) {
    return this.mapEachGroup(e => e.rolling(n, windowFn));
  }

  divideBy<S>(
    denominator: GroupedData<E, K>,
    getKey: (e: E) => S,
    getCount: (e: E) => number
  ): GroupedData<E & ProportionValues, K> {
    return this.mapEachGroup((e, k) =>
      e.divideBy(denominator.data.get(k) ?? new SingleData<E>([]), getKey, getCount)
    );
  }
}

export type ProportionValues = {
  proportion: number;
  proportionCILow: number;
  proportionCIHigh: number;
};
