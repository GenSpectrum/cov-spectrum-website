import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { CountryDateCountSampleEntry } from './CountryDateCountSampleEntry';
import { fetchCountryDateCountSamples } from '../api-lapis';
import { DetailedSampleAggDataset } from './DetailedSampleAggDataset';
import { Utils } from '../../services/Utils';
import { globalDateCache } from '../../helpers/date-cache';

export class CountryDateCountSampleDataset
  implements Dataset<LocationDateVariantSelector, CountryDateCountSampleEntry[]> {
  constructor(
    private selector: LocationDateVariantSelector,
    private payload: CountryDateCountSampleEntry[]
  ) {}

  getPayload(): CountryDateCountSampleEntry[] {
    return this.payload;
  }

  getSelector(): LocationDateVariantSelector {
    return this.selector;
  }

  static async fromApi(selector: LocationDateVariantSelector, signal?: AbortSignal) {
    return new CountryDateCountSampleDataset(selector, await fetchCountryDateCountSamples(selector, signal));
  }

  static fromDetailedSampleAggDataset(dataset: DetailedSampleAggDataset): CountryDateCountSampleDataset {
    const grouped = Utils.groupBy(dataset.getPayload(), d => d.date?.string + '###' + d.country);
    const newPayload = [];
    for (let [key, entries] of grouped.entries()) {
      const [dateString, countryString] = key.split('###');
      newPayload.push({
        date: dateString === 'null' ? null : globalDateCache.getDay(dateString),
        country: countryString === 'null' ? null : countryString,
        count: entries.reduce((prev, curr) => prev + curr.count, 0),
      });
    }
    return new CountryDateCountSampleDataset(dataset.getSelector(), newPayload);
  }
}
