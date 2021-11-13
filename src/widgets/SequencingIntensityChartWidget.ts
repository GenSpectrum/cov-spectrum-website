import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import { SequencingIntensityChart, SequencingIntensityChartProps } from './SequencingIntensityChart';
import {
  decodeLocationDateSelector,
  LocationDateSelector,
  LocationDateSelectorEncodedSchema,
} from '../data/LocationDateSelector';
import { CaseCountDataset } from '../data/CaseCountDataset';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { encodeLocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { AsyncDataset, AsyncStatusTypes } from '../data/AsyncDataset';
import { CaseCountEntry } from '../data/CaseCountEntry';

export const SequencingIntensityChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateSelectorEncodedSchema,
    async (decoded: SequencingIntensityChartProps) =>
      encodeLocationDateVariantSelector(decoded.caseCounts.selector),
    async (encoded: zod.infer<typeof LocationDateSelectorEncodedSchema>, signal) => {
      const selector = decodeLocationDateSelector(encoded);
      return {
        sequencingCounts: await DateCountSampleDataset.fromApi(selector, signal),
        caseCounts: {
          selector,
          payload: (await CaseCountDataset.fromApi(selector, signal)).getPayload(),
          status: AsyncStatusTypes.fulfilled,
        } as AsyncDataset<LocationDateSelector, CaseCountEntry[]>,
      };
    }
  ),
  SequencingIntensityChart,
  'SequencingIntensityChart'
);
