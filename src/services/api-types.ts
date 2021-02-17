import * as z from 'zod';

// Small reusable objects that aren't explicitly separate in the API doc

export const ValueWithCISchema = z.object({
  value: z.number(),
  ciLower: z.number(),
  ciUpper: z.number(),
  confidenceLevel: z.number(),
});

export const CountAndProportionWithCISchema = z.object({
  count: z.number(),
  total: z.number(),
  proportion: ValueWithCISchema,
});

const yearWeekRegex = /^(\d{4})-(\d{1,2})$/;
export const YearWeekSchema = z.string().regex(yearWeekRegex);
export function parseYearWeekString(
  yearWeek: z.infer<typeof YearWeekSchema>
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

export const YearWeekWithDaySchema = z.object({
  yearWeek: YearWeekSchema,
  firstDayInWeek: z.string(),
});

// Objects that are explicitly defined in the doc (in the same order)

export const CountrySchema = z.string();

export const SampleSchema = z.object({
  name: z.string(),
  country: CountrySchema,
  date: z.string(),
  mutations: z.array(z.string()),
  metadata: z
    .object({
      country: z.string(),
      division: z.string().nullable(),
      location: z.string().nullable(),
      zipCode: z.string().nullable(),
      host: z.string(),
      age: z
        .number()
        .nullable()
        .transform(v => (v === 0 ? null : v)),
      sex: z
        .string()
        .nullable()
        .transform(v => (v === '?' ? null : v)),
    })
    .nullable(),
});

export const SampleResultListSchema = z.object({
  total: z.number(),
  data: z.array(SampleSchema),
});

export const VariantSchema = z.object({
  name: z.string().nullable(),
  mutations: z.array(z.string()),
});

export const AgeDistributionEntrySchema = z.object({
  x: z.string(),
  y: CountAndProportionWithCISchema,
});

export const TimeDistributionEntrySchema = z.object({
  x: YearWeekWithDaySchema,
  y: CountAndProportionWithCISchema,
});

export const InternationalTimeDistributionEntrySchema = z.object({
  x: z.object({
    country: z.string(),
    week: YearWeekWithDaySchema,
  }),
  y: CountAndProportionWithCISchema,
});

export const TimeZipCodeDistributionEntrySchema = z.object({
  x: z
    .object({
      week: YearWeekWithDaySchema,
      zip_code: z.string(),
    })
    .transform(v => ({ week: v.week, zipCode: v.zip_code })),
  y: CountAndProportionWithCISchema,
});

export const GrowingVariantSchema = z.object({
  variant: VariantSchema,
  t0Count: z.number(),
  t1Count: z.number(),
  t0Proportion: z.number(),
  t1Proportion: z.number(),
  absoluteDifferenceProportion: z.number(),
  relativeDifferenceProportion: z.number().nullable(),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
});

// TypeScript types from schemas

export type Country = z.infer<typeof CountrySchema>;
export type Sample = z.infer<typeof SampleSchema>;
export type SampleResultList = z.infer<typeof SampleResultListSchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type AgeDistributionEntry = z.infer<typeof AgeDistributionEntrySchema>;
export type TimeDistributionEntry = z.infer<typeof TimeDistributionEntrySchema>;
export type InternationalTimeDistributionEntry = z.infer<typeof InternationalTimeDistributionEntrySchema>;
export type TimeZipCodeDistributionEntry = z.infer<typeof TimeZipCodeDistributionEntrySchema>;
export type GrowingVariant = z.infer<typeof GrowingVariantSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
