import { Dataset } from './Dataset';
import { CaseCountEntry } from './CaseCountEntry';
import { fetchCaseCounts } from './api';
import { LocationDateSelector } from './LocationDateSelector';
import { LocationDateVariantSelector } from './LocationDateVariantSelector';

export class CaseCountDataset implements Dataset<LocationDateSelector, CaseCountEntry[]> {
  constructor(private selector: LocationDateSelector, private payload: CaseCountEntry[]) {}

  getSelector() {
    return this.selector;
  }

  getPayload(): CaseCountEntry[] {
    return this.payload;
  }

  static async fromApi(selector: LocationDateSelector, signal?: AbortSignal) {
    return new CaseCountDataset(selector, await fetchCaseCounts(selector, signal));
  }

  static split(
    dataset: CaseCountDataset,
    getKey: (entry: CaseCountEntry) => string,
    getNewSelector: (oldSelector: LocationDateSelector, entry: CaseCountEntry) => LocationDateVariantSelector
  ): Map<string, CaseCountDataset> {
    const map = new Map<string, CaseCountDataset>();
    const oldSelector = dataset.getSelector();
    for (let entry of dataset.getPayload()) {
      const key = getKey(entry);
      if (!map.has(key)) {
        const newSelector = getNewSelector(oldSelector, entry);
        map.set(key, new CaseCountDataset(newSelector, []));
      }
      const d = map.get(key)!;
      d.payload.push(entry);
    }
    return map;
  }
}
