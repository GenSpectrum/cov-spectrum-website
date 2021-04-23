import * as zod from 'zod';

export const WasteWaterSelectorSchema = zod.object({
  country: zod.string(),
  variantName: zod.string(),
  location: zod.string(),
});

export type WasteWaterSelector = zod.infer<typeof WasteWaterSelectorSchema>;

export type WasteWaterRequest = {
  country: string;
  variantName: string;
};

export const WasteWaterResponseSchema = zod.object({
  updateDate: zod.string(),
  data: zod.array(
    zod.object({
      location: zod.string(),
      timeseriesSummary: zod.array(
        zod.object({
          date: zod.string(),
          proportion: zod.number(),
          proportionLower: zod.number(),
          proportionUpper: zod.number(),
        })
      ),
      mutationOccurrences: zod.array(
        zod.object({
          date: zod.string(),
          nucMutation: zod.string(),
          proportion: zod.number().nullable(),
        })
      ),
    })
  ),
});

export type WasteWaterResponse = zod.infer<typeof WasteWaterResponseSchema>;

export type WasteWaterTimeEntry = {
  date: Date;
  proportion: number;
  proportionCI: [number, number];
};

export type WasteWaterTimeseriesSummaryDataset = WasteWaterTimeEntry[];

export type WasteWaterHeatMapEntry = {
  date: Date;
  nucMutation: string;
  proportion?: number;
};

export type WasteWaterMutationOccurrencesDataset = WasteWaterHeatMapEntry[];

export type WasteWaterDataset = {
  updateDate: Date;
  data: Array<{
    location: string;
    timeseriesSummary: WasteWaterTimeseriesSummaryDataset;
    mutationOccurrences: WasteWaterMutationOccurrencesDataset;
  }>;
};
