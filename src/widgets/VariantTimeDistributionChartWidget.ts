import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import VariantTimeDistributionChart, {
  VariantTimeDistributionChartProps,
} from './VariantTimeDistributionChart';
import {
  decodeLocationDateVariantSelector,
  encodeLocationDateVariantSelector,
  LocationDateVariantSelectorEncodedSchema,
} from '../data/LocationDateVariantSelector';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';

export const VariantTimeDistributionChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateVariantSelectorEncodedSchema,
    async (decoded: VariantTimeDistributionChartProps) =>
      encodeLocationDateVariantSelector(decoded.variantSampleSet.getSelector()),
    async (encoded: zod.infer<typeof LocationDateVariantSelectorEncodedSchema>, signal) => {
      const variantSelector = decodeLocationDateVariantSelector(encoded);
      const wholeSelector = {
        ...variantSelector,
        variant: undefined,
      };
      return {
        variantSampleSet: await DateCountSampleDataset.fromApi(variantSelector, signal),
        wholeSampleSet: await DateCountSampleDataset.fromApi(wholeSelector, signal),
      };
    }
  ),
  VariantTimeDistributionChart,
  'VariantTimeDistributionChart'
);
