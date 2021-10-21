import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import { SequencingIntensityChart, SequencingIntensityChartProps } from './SequencingIntensityChart';
import { decodeLocationDateSelector, LocationDateSelectorEncodedSchema } from '../data/LocationDateSelector';
import { CaseCountDataset } from '../data/CaseCountDataset';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { encodeLocationDateVariantSelector } from '../data/LocationDateVariantSelector';

export const SequencingIntensityChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateSelectorEncodedSchema,
    async (decoded: SequencingIntensityChartProps) =>
      encodeLocationDateVariantSelector(decoded.caseCounts.getSelector()),
    async (encoded: zod.infer<typeof LocationDateSelectorEncodedSchema>, signal) => {
      const selector = decodeLocationDateSelector(encoded);
      return {
        sequencingCounts: await DateCountSampleDataset.fromApi(selector, signal),
        caseCounts: await CaseCountDataset.fromApi(selector, signal),
      };
    }
  ),
  SequencingIntensityChart,
  'SequencingIntensityChart'
);
