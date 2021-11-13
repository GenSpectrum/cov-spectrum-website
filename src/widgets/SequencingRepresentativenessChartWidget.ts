import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import {
  SequencingRepresentativenessChart,
  SequencingRepresentativenessChartProps,
} from './SequencingRepresentativenessChart';
import {
  decodeLocationDateSelector,
  encodeLocationDateSelector,
  LocationDateSelectorEncodedSchema,
} from '../data/LocationDateSelector';
import { CaseCountDataset } from '../data/CaseCountDataset';
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { AsyncDataset } from '../data/AsyncDataset';

export const SequencingRepresentativenessChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateSelectorEncodedSchema,
    async (decoded: SequencingRepresentativenessChartProps) =>
      encodeLocationDateSelector(decoded.caseDataset.selector),
    async (encoded, signal) => {
      const selector = decodeLocationDateSelector(encoded);
      return {
        caseDataset: new AsyncDataset(
          selector,
          (await CaseCountDataset.fromApi(selector, signal)).getPayload(),
          'fulfilled'
        ),
        sampleDataset: await DetailedSampleAggDataset.fromApi(decodeLocationDateSelector(encoded), signal),
      };
    }
  ),
  SequencingRepresentativenessChart,
  'SequencingRepresentativenessChart'
);
