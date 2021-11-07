import { Dataset } from './Dataset';
import { LocationDateVariantSelector } from './LocationDateVariantSelector';
import { SampleDetailsEntry } from './SampleDetailsEntry';
import { fetchSampleDetails } from './api-lapis';

export class SampleDetailsDataset implements Dataset<LocationDateVariantSelector, SampleDetailsEntry[]> {
  constructor(private selector: LocationDateVariantSelector, private payload: SampleDetailsEntry[]) {}

  getSelector(): LocationDateVariantSelector {
    return this.selector;
  }

  getPayload(): SampleDetailsEntry[] {
    return this.payload;
  }

  static async fromApi(selector: LocationDateVariantSelector, signal?: AbortSignal) {
    return new SampleDetailsDataset(selector, await fetchSampleDetails(selector, signal));
  }
}
