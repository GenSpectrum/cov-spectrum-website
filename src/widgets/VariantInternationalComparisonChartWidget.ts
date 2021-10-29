import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import {
  decodeLocationDateVariantSelector,
  encodeLocationDateVariantSelector,
  LocationDateVariantSelectorEncodedSchema,
} from '../data/LocationDateVariantSelector';
import {
  VariantInternationalComparisonChart,
  VariantInternationalComparisonChartProps,
} from './VariantInternationalComparisonChart';
import * as zod from 'zod';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';

export const VariantInternationalComparisonChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      variantSelector: LocationDateVariantSelectorEncodedSchema,
      countries: zod.array(zod.string()),
      logScale: zod.boolean(),
    }),
    async (decoded: VariantInternationalComparisonChartProps) => ({
      variantSelector: encodeLocationDateVariantSelector(decoded.variantInternationalSampleSet.getSelector()),
      countries: decoded.preSelectedCountries,
      logScale: decoded.logScale ?? false,
    }),
    async (encoded, signal) => {
      const variantSelector = decodeLocationDateVariantSelector(encoded.variantSelector);
      const wholeSelector = {
        ...variantSelector,
        variant: undefined,
      };
      return {
        variantInternationalSampleSet: await CountryDateCountSampleDataset.fromApi(variantSelector, signal),
        wholeInternationalSampleSet: await CountryDateCountSampleDataset.fromApi(wholeSelector, signal),
        preSelectedCountries: encoded.countries,
        logScale: encoded.logScale,
      };
    }
  ),
  VariantInternationalComparisonChart,
  'VariantInternationalComparisonChart'
);
