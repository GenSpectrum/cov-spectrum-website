import * as zod from 'zod';
import { UnifiedDay } from '../../helpers/date-cache';

export type Chen2021FitnessRequestData = {
  t: number[];
  n: number[];
  k: number[];
};

export type Chen2021FitnessRequestConfig = {
  alpha: number;
  generationTime: number;
  tStart: number;
  tEnd: number;
  reproductionNumberWildtype: number;
  initialCasesWildtype: number;
  initialCasesVariant: number;
};

export type Chen2021FitnessRequest = {
  data: Chen2021FitnessRequestData;
  config: Chen2021FitnessRequestConfig;
};

export const ValueWithCISchema = zod.object({
  value: zod.number(),
  ciLower: zod.number(),
  ciUpper: zod.number(),
});

export type ChangePoint = {
  reproductionNumberWildtype: number;
  date: Date;
};

export type ChangePointWithFc = {
  reproductionNumberWildtype: number;
  date: Date;
  fc: ValueWithCI;
};

export const ChangePointResultSchema = zod.object({
  t: zod.string(),
  fc: ValueWithCISchema,
});

export const Chen2021FitnessResponseRawSchema = zod.object({
  params: zod.object({
    a: ValueWithCISchema,
    t0: ValueWithCISchema,
    fc: ValueWithCISchema,
    fd: ValueWithCISchema,
  }),
  estimatedAbsoluteNumbers: zod.object({
    t: zod.array(zod.number()),
    variantCases: zod.array(zod.number()),
    wildtypeCases: zod.array(zod.number()),
  }),
  estimatedProportions: zod.object({
    t: zod.array(zod.number()),
    proportion: zod.array(zod.number()),
    ciLower: zod.array(zod.number()),
    ciUpper: zod.array(zod.number()),
  }),
});

export type ValueWithCI = zod.infer<typeof ValueWithCISchema>;
export type Chen2021FitnessResponseRaw = zod.infer<typeof Chen2021FitnessResponseRawSchema>;
export type Chen2021FitnessResponse = {
  params: {
    a: ValueWithCI;
    t0: ValueWithCI;
    fc: ValueWithCI;
    fd: ValueWithCI;
  };
  estimatedAbsoluteNumbers: {
    t: UnifiedDay[];
    variantCases: number[];
    wildtypeCases: number[];
  };
  estimatedProportions: {
    t: UnifiedDay[];
    proportion: number[];
    ciLower: number[];
    ciUpper: number[];
  };
};
export type ChangePointResult = zod.infer<typeof ChangePointResultSchema>;
