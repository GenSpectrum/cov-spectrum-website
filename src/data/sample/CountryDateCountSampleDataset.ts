import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { CountryDateCountSampleEntry } from './CountryDateCountSampleEntry';
import { fetchCountryDateCountSamples } from '../api-lapis';
import { DetailedSampleAggDataset } from './DetailedSampleAggDataset';
import { Utils } from '../../services/Utils';
import { globalDateCache } from '../../helpers/date-cache';

export type CountryDateCountSampleDataset = Dataset<
  LocationDateVariantSelector,
  CountryDateCountSampleEntry[]
>;

export class CountryDateCountSampleData {
  static async fromApi(
    selector: LocationDateVariantSelector,
    signal?: AbortSignal
  ): Promise<CountryDateCountSampleDataset> {
    return {
      selector: selector,
      payload: await fetchCountryDateCountSamples(selector, signal),
    };
  }

  static fromDetailedSampleAggDataset(dataset: DetailedSampleAggDataset): CountryDateCountSampleDataset {
    const grouped = Utils.groupBy(dataset.payload, d => d.date?.string + '###' + d.country);
    const newPayload = [];
    for (let [key, entries] of grouped.entries()) {
      const [dateString, countryString] = key.split('###');
      newPayload.push({
        date: dateString === 'null' ? null : globalDateCache.getDay(dateString),
        country: countryString === 'null' ? null : countryString,
        count: entries.reduce((prev, curr) => prev + curr.count, 0),
      });
    }
    return {
      selector: dataset.selector,
      payload: newPayload,
    };
  }
}
