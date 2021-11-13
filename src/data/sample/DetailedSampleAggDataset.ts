import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { fetchDetailedSamples } from '../api-lapis';
import { DetailedSampleAggEntry } from './DetailedSampleAggEntry';

export type DetailedSampleAggDataset = Dataset<LocationDateVariantSelector, DetailedSampleAggEntry[]>;

export class DetailedSampleAggData {
  static async fromApi(
    selector: LocationDateVariantSelector,
    signal?: AbortSignal
  ): Promise<DetailedSampleAggDataset> {
    return {
      selector: selector,
      payload: await fetchDetailedSamples(selector, signal),
    };
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
    const oldSelector = dataset.selector;
    for (let entry of dataset.payload) {
      const key = getKey(entry);
      if (!map.has(key)) {
        const newSelector = getNewSelector(oldSelector, entry);
        map.set(key, { selector: newSelector, payload: [] });
      }
      const d = map.get(key)!;
      d.payload.push(entry);
    }
    return map;
  }
}
