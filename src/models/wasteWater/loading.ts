import { WasteWaterDataset, WasteWaterRequest, WasteWaterResponseSchema } from './types';
import { get } from '../../services/api';

export async function getData(
  { country, variantName }: WasteWaterRequest,
  signal?: AbortSignal
): Promise<WasteWaterDataset | undefined> {
  const url = `/plot/waste-water?country=${country}&variantName=${variantName}`;
  const response = await get(url, signal);
  if (!response.ok) {
    throw new Error('server responded with non-200 status code');
  }
  const json = await response.json();
  if (!json) {
    return undefined;
  }
  const data = WasteWaterResponseSchema.parse(json);
  return {
    updateDate: new Date(data.updateDate),
    data: data.data.map(d => ({
      location: d.location,
      timeseriesSummary: d.timeseriesSummary.map(ts => ({
        date: new Date(ts.date),
        proportion: ts.proportion,
        proportionCI: [ts.proportionLower, ts.proportionUpper],
      })),
      mutationOccurrences: d.mutationOccurrences
        .filter(mo => !!mo.proportion)
        .map(mo => ({
          date: new Date(mo.date),
          nucMutation: mo.nucMutation,
          proportion: mo.proportion !== null ? mo.proportion : undefined,
        })),
    })),
  };
}
