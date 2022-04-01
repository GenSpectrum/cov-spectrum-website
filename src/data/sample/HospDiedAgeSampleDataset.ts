import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { Dataset } from '../Dataset';
import { HospDiedAgeSampleEntry } from './HospDiedAgeSampleEntry';
import { fetchHospDiedAgeSamples } from '../api-lapis';
import { LapisSelector } from '../LapisSelector';

export type HospDiedAgeSampleDataset = Dataset<LocationDateVariantSelector, HospDiedAgeSampleEntry[]>;

export class HospDiedAgeSampleData {
  static async fromApi(selector: LapisSelector, signal?: AbortSignal): Promise<HospDiedAgeSampleDataset> {
    return {
      selector: selector,
      payload: await fetchHospDiedAgeSamples(selector, signal),
    };
  }
}
