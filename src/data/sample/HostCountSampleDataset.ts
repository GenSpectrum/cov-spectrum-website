import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { HostCountSampleEntry } from './HostCountSampleEntry';
import { fetchHostCountSamples } from '../api-lapis';
import { LapisSelector } from '../LapisSelector';

export type HostCountSampleDataset = Dataset<LocationDateVariantSelector, HostCountSampleEntry[]>;

export class HostCountSampleData {
  static async fromApi(selector: LapisSelector, signal?: AbortSignal): Promise<HostCountSampleDataset> {
    return { selector, payload: await fetchHostCountSamples(selector, signal) };
  }
}
