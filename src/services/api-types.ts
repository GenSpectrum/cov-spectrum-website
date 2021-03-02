import * as zod from 'zod';

// Small reusable objects that aren't explicitly separate in the API doc

export const ValueWithCISchema = zod.object({
  value: zod.number(),
  ciLower: zod.number(),
  ciUpper: zod.number(),
  confidenceLevel: zod.number(),
});

export const CountAndProportionWithCISchema = zod.object({
  count: zod.number(),
  total: zod.number(),
  proportion: ValueWithCISchema,
});

const yearWeekRegex = /^(\d{4})-(\d{1,2})$/;
export const YearWeekSchema = zod.string().regex(yearWeekRegex);
export function parseYearWeekString(
  yearWeek: zod.infer<typeof YearWeekSchema>
): { year: number; week: number } {
  const m = yearWeek.match(yearWeekRegex);
  if (!m) {
    throw new Error('invalid YearWeek string');
  }
  const parsed = { year: +m[1], week: +m[2] };
  if (!(parsed.week >= 1 && parsed.week <= 53)) {
    throw new Error('invalid week in YearWeek string');
  }
  return parsed;
}

export const YearWeekWithDaySchema = zod.object({
  yearWeek: YearWeekSchema,
  firstDayInWeek: zod.string(),
});

// Objects that are explicitly defined in the doc (in the same order)

export const CountrySchema = zod.string();

export const SampleSchema = zod.object({
  name: zod.string(),
  country: CountrySchema,
  date: zod.string().nullable(),
  mutations: zod.array(zod.string()),
  metadata: zod
    .object({
      country: zod.string(),
      division: zod.string().nullable(),
      location: zod.string().nullable(),
      zipCode: zod.string().nullable(),
      host: zod.string(),
      age: zod
        .number()
        .nullable()
        .transform(v => (v === 0 ? null : v)),
      sex: zod
        .string()
        .nullable()
        .transform(v => (v === '?' ? null : v)),
      submittingLab: zod.string().nullable(),
      originatingLab: zod.string().nullable(),
    })
    .nullable(),
});

export const SampleResultListSchema = zod.object({
  total: zod.number(),
  data: zod.array(SampleSchema),
});

export const VariantSchema = zod.object({
  name: zod
    .string()
    .nullable()
    .transform(v => v || undefined)
    .optional(),
  mutations: zod.array(zod.string()),
});

export const AgeDistributionEntrySchema = zod.object({
  x: zod.string(),
  y: CountAndProportionWithCISchema,
});

export const TimeDistributionEntrySchema = zod.object({
  x: YearWeekWithDaySchema,
  y: CountAndProportionWithCISchema,
});

export const InternationalTimeDistributionEntrySchema = zod.object({
  x: zod.object({
    country: zod.string(),
    week: YearWeekWithDaySchema,
  }),
  y: CountAndProportionWithCISchema,
});

export const TimeZipCodeDistributionEntrySchema = zod.object({
  x: zod.object({
    week: YearWeekWithDaySchema,
    zipCode: zod.string(),
  }),
  y: zod.object({
    count: zod.number(),
  }),
});

export const GrowingVariantSchema = zod.object({
  variant: VariantSchema,
  t0Count: zod.number(),
  t1Count: zod.number(),
  t0Proportion: zod.number(),
  t1Proportion: zod.number(),
  absoluteDifferenceProportion: zod.number(),
  relativeDifferenceProportion: zod.number().nullable(),
});

export const LoginResponseSchema = zod.object({
  token: zod.string(),
});
export interface Selection {
  variant: Variant;
  matchPercentage: number;
}
// TypeScript types from schemas

export type ValueWithCI = zod.infer<typeof ValueWithCISchema>;
export type Country = zod.infer<typeof CountrySchema>;
export type Sample = zod.infer<typeof SampleSchema>;
export type SampleResultList = zod.infer<typeof SampleResultListSchema>;
export type Variant = zod.infer<typeof VariantSchema>;
export type AgeDistributionEntry = zod.infer<typeof AgeDistributionEntrySchema>;
export type TimeDistributionEntry = zod.infer<typeof TimeDistributionEntrySchema>;
export type InternationalTimeDistributionEntry = zod.infer<typeof InternationalTimeDistributionEntrySchema>;
export type TimeZipCodeDistributionEntry = zod.infer<typeof TimeZipCodeDistributionEntrySchema>;
export type GrowingVariant = zod.infer<typeof GrowingVariantSchema>;
export type LoginResponse = zod.infer<typeof LoginResponseSchema>;
