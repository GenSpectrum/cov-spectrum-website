import * as zod from 'zod';
import { LiteralSamplingStrategySchema } from '../../services/api';

export const Chen2021FitnessRequestSchema = zod.object({
  country: zod.string(),
  mutations: zod.array(zod.string()),
  matchPercentage: zod.number(),
  samplingStrategy: LiteralSamplingStrategySchema,
  alpha: zod.number(),
  generationTime: zod.number(),
  reproductionNumberWildtype: zod.number(),
  plotStartDate: zod.date(),
  plotEndDate: zod.date(),
  initialWildtypeCases: zod.number(),
  initialVariantCases: zod.number(),
});

export const ValueWithCISchema = zod.object({
  value: zod.number(),
  ciLower: zod.number(),
  ciUpper: zod.number(),
});

export const Chen2021FitnessResponseSchema = zod.object({
  daily: zod.object({
    t: zod.array(zod.string()),
    proportion: zod.array(zod.number()),
    ciLower: zod.array(zod.number()),
    ciUpper: zod.array(zod.number()),
  }),
  params: zod.object({
    a: ValueWithCISchema,
    t0: ValueWithCISchema,
    fc: ValueWithCISchema,
    fd: ValueWithCISchema,
  }),
  plotAbsoluteNumbers: zod.object({
    t: zod.array(zod.string()),
    variantCases: zod.array(zod.number()),
    wildtypeCases: zod.array(zod.number()),
  }),
  plotProportion: zod.object({
    t: zod.array(zod.string()),
    proportion: zod.array(zod.number()),
    ciLower: zod.array(zod.number()),
    ciUpper: zod.array(zod.number()),
  }),
});
