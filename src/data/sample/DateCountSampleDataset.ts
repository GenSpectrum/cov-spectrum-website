import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { DateCountSampleEntry } from './DateCountSampleEntry';
import { fetchDateCountSamples } from '../api-lapis';
import { DetailedSampleAggDataset } from './DetailedSampleAggDataset';
import { Utils } from '../../services/Utils';
import { UnifiedDay, UnifiedIsoWeek } from '../../helpers/date-cache';

export class DateCountSampleDataset implements Dataset<LocationDateVariantSelector, DateCountSampleEntry[]> {
  constructor(private selector: LocationDateVariantSelector, private payload: DateCountSampleEntry[]) {}

  getPayload(): DateCountSampleEntry[] {
    return this.payload;
  }

  getSelector(): LocationDateVariantSelector {
    return this.selector;
  }

  static async fromApi(selector: LocationDateVariantSelector, signal?: AbortSignal) {
    return new DateCountSampleDataset(selector, await fetchDateCountSamples(selector, signal));
  }

  static fromDetailedSampleAggDataset(dataset: DetailedSampleAggDataset): DateCountSampleDataset {
    const grouped = Utils.groupBy(dataset.getPayload(), d => d.date);
    const newPayload = [];
    for (let [date, entries] of grouped.entries()) {
      newPayload.push({
        date,
        count: entries.reduce((prev, curr) => prev + curr.count, 0),
      });
    }
    return new DateCountSampleDataset(dataset.getSelector(), newPayload);
  }

  static countByDay(data: DateCountSampleEntry[]): Map<UnifiedDay, number> {
    const output = new Map<UnifiedDay, number>();
    for (const entry of data) {
      if (!entry.date) {
        continue;
      }
      const oldCount = output.get(entry.date) ?? 0;
      output.set(entry.date, oldCount + entry.count);
    }
    return output;
  }

  static countByWeek(data: DateCountSampleEntry[]): Map<UnifiedIsoWeek, number> {
    const output = new Map<UnifiedIsoWeek, number>();
    for (const entry of data) {
      if (!entry.date) {
        continue;
      }
      const oldCount = output.get(entry.date.isoWeek) ?? 0;
      output.set(entry.date.isoWeek, oldCount + entry.count);
    }
    return output;
  }

  static proportionByWeek(
    variant: DateCountSampleEntry[],
    whole: DateCountSampleEntry[]
  ): Map<UnifiedIsoWeek, { count: number; proportion?: number }> {
    const variantCounts = DateCountSampleDataset.countByWeek(variant);
    const wholeCounts = DateCountSampleDataset.countByWeek(whole);
    return new Map(
      [...wholeCounts.entries()].map(([week, wholeCount]) => {
        const variantCount = variantCounts.get(week) ?? 0;
        return [
          week,
          {
            count: variantCount,
            proportion: variantCount / wholeCount,
          },
        ];
      })
    );
  }
}
