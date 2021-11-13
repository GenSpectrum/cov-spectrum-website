import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import { SequencingIntensityChart, SequencingIntensityChartProps } from './SequencingIntensityChart';
import { decodeLocationDateSelector, LocationDateSelectorEncodedSchema } from '../data/LocationDateSelector';
import { encodeLocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { AsyncStatusTypes } from '../data/AsyncDataset';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { CaseCountAsyncDataset, CaseCountData } from '../data/CaseCountDataset';

export const SequencingIntensityChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateSelectorEncodedSchema,
    async (decoded: SequencingIntensityChartProps) =>
      encodeLocationDateVariantSelector(decoded.caseCounts.selector),
    async (encoded: zod.infer<typeof LocationDateSelectorEncodedSchema>, signal) => {
      const selector = decodeLocationDateSelector(encoded);
      return {
        sequencingCounts: await DateCountSampleData.fromApi(selector, signal),
        caseCounts: {
          selector,
          payload: (await CaseCountData.fromApi(selector, signal)).payload,
          status: AsyncStatusTypes.fulfilled,
        } as CaseCountAsyncDataset,
      };
    }
  ),
  SequencingIntensityChart,
  'SequencingIntensityChart'
);
