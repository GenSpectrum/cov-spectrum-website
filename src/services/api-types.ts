import * as z from 'zod';

namespace schema {
  // Small reusable objects that aren't explicitly separate in the API doc

  export const ValueWithCI = z.object({
    value: z.number(),
    ciLower: z.number(),
    ciUpper: z.number(),
    confidenceLevel: z.number(),
  });

  export const CountAndProportionWithCI = z.object({
    count: z.number(),
    total: z.number(),
    proportion: ValueWithCI,
  });

  const yearWeekRegex = /^(\d{4})-(\d{2})$/;
  export const YearWeek = z
    .string()
    .regex(yearWeekRegex)
    .transform(v => {
      const m = v.match(yearWeekRegex)!;
      return { year: +m[1], week: +m[2] };
    })
    .refine(v => v.week >= 1 && v.week <= 53);

  export const YearWeekWithDay = z.object({
    yearWeek: YearWeek,
    firstDayInWeek: z.string().transform(v => new Date()),
  });

  // Objects that are explicitly defined in the doc (in the same order)

  export const Country = z.string();

  export const Sample = z.object({
    name: z.string(),
    country: Country,
    date: z.string().transform(v => new Date(v)),
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

  export const Variant = z.object({
    name: z.string(),
    mutations: z.array(z.string()),
  });

  export const AgeDistributionEntry = z.object({
    x: z.string(),
    y: CountAndProportionWithCI,
  });

  export const TimeDistributionEntry = z.object({
    x: YearWeekWithDay,
    y: CountAndProportionWithCI,
  });

  export const TimeZipCodeDistributionEntry = z.object({
    x: z
      .object({
        week: YearWeekWithDay,
        zip_code: z.string(),
      })
      .transform(v => ({ week: v.week, zipCode: v.zip_code })),
    y: CountAndProportionWithCI,
  });

  export const GrowingVariant = z.object({
    variant: Variant,
    t0Count: z.number(),
    t1Count: z.number(),
    t0Proportions: z.number(),
    t1Proportions: z.number(),
    absoluteDifferenceProportion: z.number(),
    relativeDifferenceProportion: z.number(),
  });

  export const LoginResponse = z.object({
    token: z.string(),
  });
}

export type Country = z.infer<typeof schema.Country>;
export type Sample = z.infer<typeof schema.Sample>;
export type Variant = z.infer<typeof schema.Variant>;
export type AgeDistributionEntry = z.infer<typeof schema.AgeDistributionEntry>;
export type TimeDistributionEntry = z.infer<typeof schema.TimeDistributionEntry>;
export type TimeZipCodeDistributionEntry = z.infer<typeof schema.TimeZipCodeDistributionEntry>;
export type GrowingVariant = z.infer<typeof schema.GrowingVariant>;
export type LoginResponse = z.infer<typeof schema.LoginResponse>;
