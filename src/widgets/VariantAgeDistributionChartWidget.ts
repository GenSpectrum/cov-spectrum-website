import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import VariantAgeDistributionChart, { VariantAgeDistributionChartProps } from './VariantAgeDistributionChart';
import {
  decodeLocationDateVariantSelector,
  encodeLocationDateVariantSelector,
  LocationDateVariantSelectorEncodedSchema,
} from '../data/LocationDateVariantSelector';
import { AgeCountSampleData } from '../data/sample/AgeCountSampleDataset';
import { addDefaultHostAndQc } from '../data/HostAndQcSelector';

export const VariantAgeDistributionChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateVariantSelectorEncodedSchema,
    async (decoded: VariantAgeDistributionChartProps) =>
      encodeLocationDateVariantSelector(decoded.variantSampleSet.selector),
    async (encoded: zod.infer<typeof LocationDateVariantSelectorEncodedSchema>, signal) => {
      const variantSelector = decodeLocationDateVariantSelector(encoded);
      const wholeSelector = {
        ...variantSelector,
        variant: undefined,
      };
      return {
        variantSampleSet: await AgeCountSampleData.fromApi(addDefaultHostAndQc(variantSelector), signal),
        wholeSampleSet: await AgeCountSampleData.fromApi(addDefaultHostAndQc(wholeSelector), signal),
      };
    }
  ),
  VariantAgeDistributionChart,
  'VariantAgeDistributionChart'
);
