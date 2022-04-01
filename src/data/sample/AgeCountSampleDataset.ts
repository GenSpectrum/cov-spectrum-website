import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { AgeCountSampleEntry } from './AgeCountSampleEntry';
import { fetchAgeCountSamples } from '../api-lapis';
import { LapisSelector } from '../LapisSelector';

export type AgeCountSampleDataset = Dataset<LocationDateVariantSelector, AgeCountSampleEntry[]>;

export class AgeCountSampleData {
  static async fromApi(selector: LapisSelector, signal?: AbortSignal): Promise<AgeCountSampleDataset> {
    return {
      selector,
      payload: await fetchAgeCountSamples(selector, signal),
    };
  }

  static fromAgeToAgeGroup(age: number): string {
    if (age < 10) return '0-9';
    if (age < 20) return '10-19';
    if (age < 30) return '20-29';
    if (age < 40) return '30-39';
    if (age < 50) return '40-49';
    if (age < 60) return '50-59';
    if (age < 70) return '60-69';
    if (age < 80) return '70-79';
    if (age >= 80) return '80+';
    throw new Error('Unexpected/impossible case: age=' + age);
  }

  static countByAgeGroup(data: AgeCountSampleEntry[]): Map<string, number> {
    const output = new Map<string, number>();
    for (const entry of data) {
      if (entry.age === null) {
        continue;
      }
      const ageGroup = AgeCountSampleData.fromAgeToAgeGroup(entry.age);
      const oldCount = output.get(ageGroup) ?? 0;
      output.set(ageGroup, oldCount + entry.count);
    }
    return output;
  }

  static proportionByAgeGroup(
    variant: AgeCountSampleEntry[],
    whole: AgeCountSampleEntry[]
  ): Map<string, { count: number; proportion?: number }> {
    const variantCounts = AgeCountSampleData.countByAgeGroup(variant);
    const wholeCounts = AgeCountSampleData.countByAgeGroup(whole);
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
