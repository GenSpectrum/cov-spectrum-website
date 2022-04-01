import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { CountryDateCountSampleEntry } from './CountryDateCountSampleEntry';
import { fetchCountryDateCountSamples } from '../api-lapis';
import { LapisSelector } from '../LapisSelector';

export type CountryDateCountSampleDataset = Dataset<
  LocationDateVariantSelector,
  CountryDateCountSampleEntry[]
>;

export class CountryDateCountSampleData {
  static async fromApi(
    selector: LapisSelector,
    signal?: AbortSignal
  ): Promise<CountryDateCountSampleDataset> {
    return {
      selector: selector,
      payload: await fetchCountryDateCountSamples(selector, signal),
    };
  }
}
