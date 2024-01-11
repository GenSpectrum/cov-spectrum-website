import * as zod from 'zod';
import { UnifiedDay } from '../../helpers/date-cache';

export const WasteWaterSelectorSchema = zod.object({
  country: zod.string(),
  variantName: zod.string().optional(),
  location: zod.string().optional(),
});

export type WasteWaterRequest = {
  country: string;
};

export const WasteWaterResponseSchema = zod.object({
  data: zod.array(
    zod.object({
      location: zod.string(),
      variantName: zod.string(),
      data: zod.object({
        timeseriesSummary: zod.array(
          zod.object({
            date: zod.string(),
            proportion: zod.number(),
            proportionLower: zod.number(),
            proportionUpper: zod.number(),
          })
        ),
        mutationOccurrences: zod
          .array(
            zod.object({
              date: zod.string(),
              nucMutation: zod.string(),
              proportion: zod.number().nullable(),
            })
          )
          .nullable(),
      }),
    })
  ),
});

export type WasteWaterTimeEntry = {
  date: UnifiedDay;
  proportion: number;
  proportionCI: [number, number];
};

export type WasteWaterTimeseriesSummaryDataset = WasteWaterTimeEntry[];

export type WasteWaterHeatMapEntry = {
  date: UnifiedDay;
  nucMutation: string;
  proportion?: number;
};

export type WasteWaterMutationOccurrencesDataset = WasteWaterHeatMapEntry[];

export type WasteWaterDatasetEntry = {
  location: string;
  variantName: string;
  data: {
    timeseriesSummary: WasteWaterTimeseriesSummaryDataset;
    mutationOccurrences: WasteWaterMutationOccurrencesDataset | undefined;
  };
};

export type WasteWaterDataset = Array<WasteWaterDatasetEntry>;
