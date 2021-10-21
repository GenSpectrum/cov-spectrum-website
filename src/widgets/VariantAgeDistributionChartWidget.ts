import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import VariantAgeDistributionChart, { VariantAgeDistributionChartProps } from './VariantAgeDistributionChart';
import {
  decodeLocationDateVariantSelector,
  encodeLocationDateVariantSelector,
  LocationDateVariantSelectorEncodedSchema,
} from '../data/LocationDateVariantSelector';
import { AgeCountSampleDataset } from '../data/sample/AgeCountSampleDataset';

export const VariantAgeDistributionChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateVariantSelectorEncodedSchema,
    async (decoded: VariantAgeDistributionChartProps) =>
      encodeLocationDateVariantSelector(decoded.variantSampleSet.getSelector()),
    async (encoded: zod.infer<typeof LocationDateVariantSelectorEncodedSchema>, signal) => {
      const variantSelector = decodeLocationDateVariantSelector(encoded);
      const wholeSelector = {
        ...variantSelector,
        variant: undefined,
      };
      return {
        variantSampleSet: await AgeCountSampleDataset.fromApi(variantSelector, signal),
        wholeSampleSet: await AgeCountSampleDataset.fromApi(wholeSelector, signal),
      };
    }
  ),
  VariantAgeDistributionChart,
  'VariantAgeDistributionChart'
);
