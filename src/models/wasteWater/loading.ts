import {
  WasteWaterDataset,
  WasteWaterDatasetEntry,
  WasteWaterRequest,
  WasteWaterResponse,
  WasteWaterResponseSchema,
} from './types';
import { get } from '../../services/api';
import { globalDateCache } from '../../helpers/date-cache';

export async function getData(
  { country }: WasteWaterRequest,
  signal?: AbortSignal
): Promise<WasteWaterDataset | undefined> {
  const url = `/plot/waste-water?country=${country}`;
  const response = await get(url, signal);
  if (!response.ok) {
    throw new Error('server responded with non-200 status code');
  }
  const json = await response.json();
  if (!json) {
    return undefined;
  }
  const responseData: WasteWaterResponse = WasteWaterResponseSchema.parse(json);
  return responseData.data.map(d => ({
    location: d.location,
    variantName: d.variantName,
    data: {
      timeseriesSummary: d.data.timeseriesSummary.map(ts => ({
        date: globalDateCache.getDay(ts.date),
        proportion: ts.proportion,
        proportionCI: [ts.proportionLower, ts.proportionUpper],
      })),
      mutationOccurrences: d.data.mutationOccurrences
        .filter(mo => !!mo.proportion)
        .map(mo => ({
          date: globalDateCache.getDay(mo.date),
          nucMutation: mo.nucMutation,
          proportion: mo.proportion ?? undefined,
        })),
    },
  }));
}

export function filter(data: WasteWaterDataset, variantName?: string, location?: string): WasteWaterDataset {
  return data.filter(d => {
    if (variantName && d.variantName !== variantName) {
      return false;
    }
    if (location && d.location !== location) {
      return false;
    }
    return true;
  });
}

export function filterSingle(
  data: WasteWaterDataset,
  variantName: string,
  location: string
): WasteWaterDatasetEntry | undefined {
  const filtered = filter(data, variantName, location);
  return filtered.length > 0 ? filtered[0] : undefined;
}
