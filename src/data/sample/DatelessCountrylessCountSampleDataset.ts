import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { fetchDatelessCountrylessCountSamples } from '../api-lapis';
import { DetailedSampleAggDataset } from './DetailedSampleAggDataset';
import { Utils } from '../../services/Utils';
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

  static fromDetailedSampleAggDataset(
    dataset: DetailedSampleAggDataset
  ): DatelessCountrylessCountSampleDataset {
    const grouped = Utils.groupBy(
      dataset.payload,
      d => d.division + '###' + d.age + '###' + d.sex + '###' + d.hospitalized + '###' + d.died
    );
    const newPayload = [];
    for (let [key, entries] of grouped.entries()) {
      const [division, age, sex, hospitalized, died] = key.split('###');
      newPayload.push({
        division: division === 'null' ? null : division,
        age: age === 'null' ? null : Number.parseInt(age),
        sex: sex === 'null' ? null : sex,
        hospitalized: JSON.parse(hospitalized),
        died: JSON.parse(died),
        count: entries.reduce((prev, curr) => prev + curr.count, 0),
      });
    }
    return {
      selector: dataset.selector,
      payload: newPayload,
    };
  }
}
