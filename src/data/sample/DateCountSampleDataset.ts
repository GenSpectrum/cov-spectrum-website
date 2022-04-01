import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { DateCountSampleEntry } from './DateCountSampleEntry';
import { fetchDateCountSamples } from '../api-lapis';
import { UnifiedDay, UnifiedIsoWeek } from '../../helpers/date-cache';
import { LapisSelector } from '../LapisSelector';

export type DateCountSampleDataset = Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>;

export class DateCountSampleData {
  static async fromApi(selector: LapisSelector, signal?: AbortSignal): Promise<DateCountSampleDataset> {
    return {
      selector: selector,
      payload: await fetchDateCountSamples(selector, signal),
    };
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
    const variantCounts = DateCountSampleData.countByWeek(variant);
    const wholeCounts = DateCountSampleData.countByWeek(whole);
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
