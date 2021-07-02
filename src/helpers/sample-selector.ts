import {
  CountrySchema,
  DateStringSchema,
  NamedVariant,
  RegionSchema,
  VariantSchema,
} from '../services/api-types';
import * as zod from 'zod';
import { LiteralSamplingStrategySchema } from '../services/api';

export const VariantSelectorSchema = zod.object({
  variant: VariantSchema,
  matchPercentage: zod.number(),
});

export const OldSampleSelectorSchema = zod.object({
  country: CountrySchema,
  matchPercentage: zod.number(),
  mutations: zod.array(zod.string()).optional(),
  pangolinLineage: zod.string().optional(),
  samplingStrategy: LiteralSamplingStrategySchema,
});

export const NewSampleSelectorSchema = zod.object({
  region: RegionSchema.optional(),
  country: CountrySchema.optional(),
  mutations: zod.array(zod.string()).optional(),
  matchPercentage: zod.number().optional(),
  pangolinLineage: zod.string().optional(),
  dataType: LiteralSamplingStrategySchema,
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
});

export type VariantSelector = zod.infer<typeof VariantSelectorSchema>;
export type NamedVariantSelector = VariantSelector & { variant: NamedVariant };
export type NewSampleSelector = zod.infer<typeof NewSampleSelectorSchema>;
