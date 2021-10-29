import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import { Widget } from './Widget';
import {
  decodeLocationDateVariantSelector,
  encodeLocationDateVariantSelector,
  LocationDateVariantSelectorEncodedSchema,
} from '../data/LocationDateVariantSelector';
import {
  VariantDivisionDistributionChart,
  VariantDivisionDistributionChartProps,
} from './VariantDivisionDistributionChart';
import { DivisionCountSampleDataset } from '../data/sample/DivisionCountSampleDataset';

export const VariantDivisionDistributionChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateVariantSelectorEncodedSchema,
    async (decoded: VariantDivisionDistributionChartProps) =>
      encodeLocationDateVariantSelector(decoded.variantSampleSet.getSelector()),
    async (encoded: zod.infer<typeof LocationDateVariantSelectorEncodedSchema>, signal) => {
      const variantSelector = decodeLocationDateVariantSelector(encoded);
      const wholeSelector = {
        ...variantSelector,
        variant: undefined,
      };
      return {
        variantSampleSet: await DivisionCountSampleDataset.fromApi(variantSelector, signal),
        wholeSampleSet: await DivisionCountSampleDataset.fromApi(wholeSelector, signal),
      };
    }
  ),
  VariantDivisionDistributionChart,
  'VariantDivisionDistributionChart'
);
