import { CountrySchema, VariantSchema } from '../services/api-types';
import * as zod from 'zod';
import { LiteralSamplingStrategySchema } from '../services/api';

export const VariantSelectorSchema = zod.object({
  variant: VariantSchema,
  matchPercentage: zod.number(),
});

export const SampleSelectorSchema = zod.object({
  country: CountrySchema,
  matchPercentage: zod.number(),
  mutations: zod.array(zod.string()),
  samplingStrategy: LiteralSamplingStrategySchema,
});

export type VariantSelector = zod.infer<typeof VariantSelectorSchema>;
