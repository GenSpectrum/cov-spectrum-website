import { Dataset } from './Dataset';
import { LocationDateVariantSelector } from './LocationDateVariantSelector';
import { ContributorsEntry } from './ContributorsEntry';
import { fetchContributors } from './api-lapis';

export type ContributorsDataset = Dataset<LocationDateVariantSelector, ContributorsEntry[]>;

export class ContributorsData {
  static async fromApi(
    selector: LocationDateVariantSelector,
    signal?: AbortSignal
  ): Promise<ContributorsDataset> {
    return {
      selector: selector,
      payload: await fetchContributors(selector, signal),
    };
  }
}
