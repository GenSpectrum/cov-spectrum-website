import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
//import VariantTimeDistributionBarChart from './VariantTimeDistributionBarChart';
import AbsNumVariantTimeDistributionBarChart from './AbsNumVariantTimeDistributionBarChart';
import {
  decodeLocationDateVariantSelector,
  encodeLocationDateVariantSelector,
  LocationDateVariantSelectorEncodedSchema,
} from '../data/LocationDateVariantSelector';
import { DateCountSampleData, DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { VariantTimeDistributionLineChart } from './VariantTimeDistributionLineChart';

export type VariantTimeDistributionChartProps = {
  variantSampleSet: DateCountSampleDataset;
  wholeSampleSet: DateCountSampleDataset;
  absNumView: boolean
};

export const VariantTimeDistributionChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateVariantSelectorEncodedSchema,
    async (decoded: VariantTimeDistributionChartProps) =>
      encodeLocationDateVariantSelector(decoded.variantSampleSet.selector),
    async (encoded: zod.infer<typeof LocationDateVariantSelectorEncodedSchema>, signal) => {
      const variantSelector = decodeLocationDateVariantSelector(encoded);
      const wholeSelector = {
        ...variantSelector,
        variant: undefined,
      };
      return {
        variantSampleSet: await DateCountSampleData.fromApi(variantSelector, signal),
        wholeSampleSet: await DateCountSampleData.fromApi(wholeSelector, signal),
        absNumView: false
      };
    }
  ),
  [
    { label: 'Line chart', component: VariantTimeDistributionLineChart },
    //{ label: 'Bar chart', component: VariantTimeDistributionBarChart },
    { label: 'Bar chart', component: AbsNumVariantTimeDistributionBarChart },
  ],
  'VariantTimeDistributionChart'
);
