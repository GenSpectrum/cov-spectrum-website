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

export const yearWeekRegex = /^(\d{4})-(\d{1,2})$/;
export const YearWeekSchema = zod.string().regex(yearWeekRegex);

export const YearWeekWithDaySchema = zod.object({
  yearWeek: YearWeekSchema,
  firstDayInWeek: zod.string(),
});

export const dateStringRegex = /^\d{4}-\d{2}-\d{2}$/;
export const DateStringSchema = zod.string().regex(dateStringRegex);

// Objects that are explicitly defined in the doc (in the same order)

export const CountrySchema = zod.string();

export const RegionSchema = zod.string();

// This is an item from the response to /resource/sample2
export const RawMultiSampleSchema = zod.object({
  date: DateStringSchema,
  region: RegionSchema,
  country: CountrySchema,
  division: zod.string().nullable(),
  zipCode: zod.string().nullable(),
  ageGroup: zod.string().nullable(),
  sex: zod.union([zod.literal('Male'), zod.literal('Female')]).nullable(),
  hospitalized: zod.boolean().nullable(),
  deceased: zod.boolean().nullable(),
  count: zod.number(),
});

export const SampleSchema = zod.object({
  name: zod.string(),
  country: CountrySchema,
  date: zod.string().nullable(),
  mutations: zod.array(zod.string()).nullable(),
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

export const PangolinLineageListSchema = zod.array(
  zod.object({
    pangolinLineage: zod.string().nullable(),
    count: zod.number(),
  })
);

export const VariantSchema = zod.object({
  name: zod
    .string()
    .nullable()
    .transform(v => v || undefined)
    .optional(),
  mutations: zod.array(zod.string()),
});
export const SequencingIntensityEntrySchema = zod.object({
  x: DateStringSchema,
  y: zod.object({
    numberCases: zod.number(),
    numberSequenced: zod.number(),
  }),
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

export const InterestingVariantSchema = zod.object({
  variant: VariantSchema,
  a: zod.number(),
  f: zod.number(),
  absoluteNumberSamplesInPastThreeMonths: zod.number(),
  relativeNumberSamplesInPastThreeMonths: zod.number(),
});

export const InterestingVariantResultSchema = zod.object({
  computedAt: zod.string(),
  variants: zod.array(
    zod.object({
      mutations: zod.array(
        zod.object({
          mutation: zod.string(),
          uniquenessScore: zod.number(),
        })
      ),
      a: ValueWithCISchema,
      f: ValueWithCISchema,
      absoluteNumberSamplesInPastThreeMonths: zod.number(),
      relativeNumberSamplesInPastThreeMonths: zod.number(),
    })
  ),
});

export const LoginResponseSchema = zod.object({
  token: zod.string(),
});

export const PangolinLineageInformationSchema = zod.object({
  commonMutations: zod.array(
    zod.object({
      mutation: zod.string(),
      count: zod.number(),
      proportion: zod.number(),
    })
  ),
});

export const ArticleSchema = zod.object({
  doi: zod.string(),
  title: zod.string(),
  authors: zod.array(zod.string()),
  date: DateStringSchema,
  category: zod.string().nullable(),
  published: zod.string().nullable(),
  server: zod.string(),
  abstract: zod.string().nullable(),
});

export const DataStatusSchema = zod.object({
  lastUpdateTimestamp: zod.string(),
});

export const CaseCountEntrySchema = zod.object({
  division: zod.string().nullable(),
  ageGroup: zod.string().nullable(),
  sex: zod.string().nullable(),
  hospitalized: zod.boolean().nullable(),
  deceased: zod.boolean().nullable(),
  count: zod.number(),
});

export const SequenceCountEntrySchema = CaseCountEntrySchema;

export const SequencingRepresentativenessSelectorSchema = zod.object({
  country: CountrySchema.optional(),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
});

// TypeScript types from schemas
export type ValueWithCI = zod.infer<typeof ValueWithCISchema>;
export type CountAndProportionWithCI = zod.infer<typeof CountAndProportionWithCISchema>;
export type YearWeekWithDay = zod.infer<typeof YearWeekWithDaySchema>;
export type Country = zod.infer<typeof CountrySchema>;
export type Region = zod.infer<typeof RegionSchema>;
export type RawMultiSample = zod.infer<typeof RawMultiSampleSchema>;
export type Sample = zod.infer<typeof SampleSchema>;
export type SampleResultList = zod.infer<typeof SampleResultListSchema>;
export type PangolinLineageList = zod.infer<typeof PangolinLineageListSchema>;
export type Variant = zod.infer<typeof VariantSchema>;
export type InterestingVariantResult = zod.infer<typeof InterestingVariantResultSchema>;
export type LoginResponse = zod.infer<typeof LoginResponseSchema>;
export type SequencingIntensityEntry = zod.infer<typeof SequencingIntensityEntrySchema>;
export type PangolinLineageInformation = zod.infer<typeof PangolinLineageInformationSchema>;
export type Article = zod.infer<typeof ArticleSchema>;
export type DataStatus = zod.infer<typeof DataStatusSchema>;
export type CaseCountEntry = zod.infer<typeof CaseCountEntrySchema>;
export type SequenceCountEntry = zod.infer<typeof SequenceCountEntrySchema>;
export type SequencingRepresentativenessSelector = zod.infer<
  typeof SequencingRepresentativenessSelectorSchema
>;

export type Place = Country | Region;
