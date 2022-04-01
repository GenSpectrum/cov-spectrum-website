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
import { DivisionCountSampleData } from '../data/sample/DivisionCountSampleDataset';
import { addDefaultHostAndQc } from '../data/HostAndQcSelector';

export const VariantDivisionDistributionChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateVariantSelectorEncodedSchema,
    async (decoded: VariantDivisionDistributionChartProps) =>
      encodeLocationDateVariantSelector(decoded.variantSampleSet.selector),
    async (encoded: zod.infer<typeof LocationDateVariantSelectorEncodedSchema>, signal) => {
      const variantSelector = decodeLocationDateVariantSelector(encoded);
      const wholeSelector = {
        ...variantSelector,
        variant: undefined,
      };
      return {
        variantSampleSet: await DivisionCountSampleData.fromApi(addDefaultHostAndQc(variantSelector), signal),
        wholeSampleSet: await DivisionCountSampleData.fromApi(addDefaultHostAndQc(wholeSelector), signal),
      };
    }
  ),
  VariantDivisionDistributionChart,
  'VariantDivisionDistributionChart'
);
