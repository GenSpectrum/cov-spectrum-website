import { Dataset } from './Dataset';
import { CaseCountEntry } from './CaseCountEntry';
import { fetchCaseCounts } from './api';
import { LocationDateSelector } from './LocationDateSelector';
import { AsyncDataset } from './AsyncDataset';

export type CaseCountDataset = Dataset<LocationDateSelector, CaseCountEntry[]>;
export type CaseCountAsyncDataset = AsyncDataset<LocationDateSelector, CaseCountEntry[]>;

export class CaseCountData {
  static async fromApi(selector: LocationDateSelector, signal?: AbortSignal): Promise<CaseCountDataset> {
    return {
      selector: selector,
      payload: await fetchCaseCounts(selector, signal),
    };
  }

  static split(
    dataset: CaseCountDataset,
    getKey: (entry: CaseCountEntry) => string,
    getNewSelector: (oldSelector: LocationDateSelector, entry: CaseCountEntry) => LocationDateSelector
  ): Map<string, CaseCountDataset> {
    const map = new Map<string, CaseCountDataset>();
    const oldSelector = dataset.selector;
    for (let entry of dataset.payload) {
      const key = getKey(entry);
      if (!map.has(key)) {
        const newSelector = getNewSelector(oldSelector, entry);
        map.set(key, {
          selector: newSelector,
          payload: [],
        });
      }
      const d = map.get(key)!;
      d.payload.push(entry);
    }
    return map;
  }
}
