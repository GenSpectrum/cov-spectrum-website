import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { PangoCountSampleEntry } from './PangoCountSampleEntry';
import { fetchPangoLineageCountSamples } from '../api-lapis';

export class PangoCountSampleDataset
  implements Dataset<LocationDateVariantSelector, PangoCountSampleEntry[]> {
  constructor(private selector: LocationDateVariantSelector, private payload: PangoCountSampleEntry[]) {}

  getPayload(): PangoCountSampleEntry[] {
    return this.payload;
  }

  getSelector(): LocationDateVariantSelector {
    return this.selector;
  }

  static async fromApi(selector: LocationDateVariantSelector, signal?: AbortSignal) {
    return new PangoCountSampleDataset(selector, await fetchPangoLineageCountSamples(selector, signal));
  }
}
