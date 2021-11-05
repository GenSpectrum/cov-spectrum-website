import { Dataset } from './Dataset';
import { LocationDateVariantSelector } from './LocationDateVariantSelector';
import { ContributorsEntry } from './ContributorsEntry';
import { fetchContributors } from './api-lapis';

export class ContributorsDataset implements Dataset<LocationDateVariantSelector, ContributorsEntry[]> {
  constructor(private selector: LocationDateVariantSelector, private payload: ContributorsEntry[]) {}

  getSelector(): LocationDateVariantSelector {
    return this.selector;
  }

  getPayload(): ContributorsEntry[] {
    return this.payload;
  }

  static async fromApi(selector: LocationDateVariantSelector, signal?: AbortSignal) {
    return new ContributorsDataset(selector, await fetchContributors(selector, signal));
  }
}
