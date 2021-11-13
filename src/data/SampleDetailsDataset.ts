import { Dataset } from './Dataset';
import { LocationDateVariantSelector } from './LocationDateVariantSelector';
import { SampleDetailsEntry } from './SampleDetailsEntry';
import { fetchSampleDetails } from './api-lapis';

export type SampleDetailsDataset = Dataset<LocationDateVariantSelector, SampleDetailsEntry[]>;

export class SampleDetailsData {
  static async fromApi(
    selector: LocationDateVariantSelector,
    signal?: AbortSignal
  ): Promise<SampleDetailsDataset> {
    return { selector, payload: await fetchSampleDetails(selector, signal) };
  }
}
