import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { fetchDetailedSamples } from '../api-lapis';
import { DetailedSampleAggEntry } from './DetailedSampleAggEntry';

export class DetailedSampleAggDataset
  implements Dataset<LocationDateVariantSelector, DetailedSampleAggEntry[]> {
  constructor(private selector: LocationDateVariantSelector, private payload: DetailedSampleAggEntry[]) {}

  getPayload(): DetailedSampleAggEntry[] {
    return this.payload;
  }

  getSelector(): LocationDateVariantSelector {
    return this.selector;
  }

  static async fromApi(selector: LocationDateVariantSelector, signal?: AbortSignal) {
    return new DetailedSampleAggDataset(selector, await fetchDetailedSamples(selector, signal));
  }

  static split(
    dataset: DetailedSampleAggDataset,
    getKey: (entry: DetailedSampleAggEntry) => string,
    getNewSelector: (
      oldSelector: LocationDateVariantSelector,
      entry: DetailedSampleAggEntry
    ) => LocationDateVariantSelector
  ): Map<string, DetailedSampleAggDataset> {
    const map = new Map<string, DetailedSampleAggDataset>();
    const oldSelector = dataset.getSelector();
    for (let entry of dataset.getPayload()) {
      const key = getKey(entry);
      if (!map.has(key)) {
        const newSelector = getNewSelector(oldSelector, entry);
        map.set(key, new DetailedSampleAggDataset(newSelector, []));
      }
      const d = map.get(key)!;
      d.payload.push(entry);
    }
    return map;
  }
}
