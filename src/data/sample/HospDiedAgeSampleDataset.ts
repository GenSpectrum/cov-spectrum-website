import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { Dataset } from '../Dataset';
import { HospDiedAgeSampleEntry } from './HospDiedAgeSampleEntry';
import { fetchHospDiedAgeSamples } from '../api-lapis';

export type HospDiedAgeSampleDataset = Dataset<LocationDateVariantSelector, HospDiedAgeSampleEntry[]>;

export class HospDiedAgeSampleData {
  static async fromApi(
    selector: LocationDateVariantSelector,
    signal?: AbortSignal
  ): Promise<HospDiedAgeSampleDataset> {
    return {
      selector: selector,
      payload: await fetchHospDiedAgeSamples(selector, signal),
    };
  }
}
