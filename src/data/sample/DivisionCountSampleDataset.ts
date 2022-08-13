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

  static countByDivisionGroup(
    data: DivisionCountSampleEntry[]
  ): {
    divisionData: Map<string, number>;
    geoInfoArray: { country: string | null; region: string | null }[];
  } {
    let geoInfoArray: { country: string | null; region: string | null }[] = [];
    const output = new Map<string, number>();
    for (const entry of data) {
      if (entry.division === null) {
        continue;
      }

      const oldCount = output.get(entry.division) ?? 0;
      output.set(entry.division, oldCount + entry.count);
      geoInfoArray.push({ country: entry.country, region: entry.region });
    }
    return { divisionData: output, geoInfoArray: geoInfoArray };
  }

  static proportionByDivision(
    variant: DivisionCountSampleEntry[],
    whole: DivisionCountSampleEntry[]
  ): {
    divisionData: Map<string, { count: number; proportion?: number }>;
    geoInfoArray: { country: string | null; region: string | null }[];
  } {
    const variantCounts = DivisionCountSampleData.countByDivisionGroup(variant).divisionData;
    const wholeCounts = DivisionCountSampleData.countByDivisionGroup(whole).divisionData;

    let divisionData: Map<string, { count: number; proportion?: number }> = new Map(
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

    return {
      divisionData: divisionData,
      geoInfoArray: DivisionCountSampleData.countByDivisionGroup(variant).geoInfoArray,
    };
  }
}
