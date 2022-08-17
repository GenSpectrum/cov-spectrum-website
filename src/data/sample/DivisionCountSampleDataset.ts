import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { DivisionCountSampleEntry } from './DivisionCountSampleEntry';
import { fetchDivisionCountSamples } from '../api-lapis';
import { LapisSelector } from '../LapisSelector';

export type DivisionCountSampleDataset = Dataset<LocationDateVariantSelector, DivisionCountSampleEntry[]>;

export class DivisionCountSampleData {
  static async fromApi(selector: LapisSelector, signal?: AbortSignal): Promise<DivisionCountSampleDataset> {
    return {
      selector: selector,
      payload: await fetchDivisionCountSamples(selector, signal),
    };
  }
}
