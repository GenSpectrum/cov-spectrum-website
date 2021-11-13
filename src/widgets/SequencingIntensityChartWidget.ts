import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import { SequencingIntensityChart, SequencingIntensityChartProps } from './SequencingIntensityChart';
import { decodeLocationDateSelector, LocationDateSelectorEncodedSchema } from '../data/LocationDateSelector';
import { CaseCountDataset } from '../data/CaseCountDataset';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { encodeLocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { AsyncDataset } from '../data/AsyncDataset';

export const SequencingIntensityChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateSelectorEncodedSchema,
    async (decoded: SequencingIntensityChartProps) =>
      encodeLocationDateVariantSelector(decoded.caseCounts.selector),
    async (encoded: zod.infer<typeof LocationDateSelectorEncodedSchema>, signal) => {
      const selector = decodeLocationDateSelector(encoded);
      return {
        sequencingCounts: await DateCountSampleDataset.fromApi(selector, signal),
        caseCounts: new AsyncDataset(
          selector,
          (await CaseCountDataset.fromApi(selector, signal)).getPayload(),
          'fulfilled'
        ),
      };
    }
  ),
  SequencingIntensityChart,
  'SequencingIntensityChart'
);
