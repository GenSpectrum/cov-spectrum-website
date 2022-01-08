import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { fetchDatelessCountrylessCountSamples } from '../api-lapis';
import { Dataset } from '../Dataset';
import { DatelessCountrylessCountSampleEntry } from './DatelessCountrylessCountSampleEntry';

export type DatelessCountrylessCountSampleDataset = Dataset<
  LocationDateVariantSelector,
  DatelessCountrylessCountSampleEntry[]
>;

export class DatelessCountrylessCountSampleData {
  static async fromApi(
    selector: LocationDateVariantSelector,
    signal?: AbortSignal
  ): Promise<DatelessCountrylessCountSampleDataset> {
    return {
      selector: selector,
      payload: await fetchDatelessCountrylessCountSamples(selector, signal),
    };
  }
}
