import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { DivisionCountSampleEntry } from './DivisionCountSampleEntry';
import { fetchDivisionCountSamples } from '../api-lapis';

export type DivisionCountSampleDataset = Dataset<LocationDateVariantSelector, DivisionCountSampleEntry[]>;

export class DivisionCountSampleData {
  static async fromApi(
    selector: LocationDateVariantSelector,
    signal?: AbortSignal
  ): Promise<DivisionCountSampleDataset> {
    return {
      selector: selector,
      payload: await fetchDivisionCountSamples(selector, signal),
    };
  }

  static countByDivisionGroup(data: DivisionCountSampleEntry[]): Map<string, number> {
    const output = new Map<string, number>();
    for (const entry of data) {
      if (entry.division === null) {
        continue;
      }
      const oldCount = output.get(entry.division) ?? 0;
      output.set(entry.division, oldCount + entry.count);
    }
    return output;
  }

  static proportionByDivision(
    variant: DivisionCountSampleEntry[],
    whole: DivisionCountSampleEntry[]
  ): Map<string, { count: number; proportion?: number }> {
    const variantCounts = DivisionCountSampleData.countByDivisionGroup(variant);
    const wholeCounts = DivisionCountSampleData.countByDivisionGroup(whole);
    return new Map(
      [...variantCounts.entries()].map(([k, v]) => {
        const wholeCount = wholeCounts.get(k);
        return [
          k,
          {
            count: v,
            proportion: wholeCount === undefined ? undefined : v / wholeCount,
          },
        ];
      })
    );
  }
}
