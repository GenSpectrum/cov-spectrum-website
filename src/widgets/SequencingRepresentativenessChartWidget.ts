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
import { CaseCountAsyncDataset, CaseCountData } from '../data/CaseCountDataset';
import { DetailedSampleAggData } from '../data/sample/DetailedSampleAggDataset';
import { AsyncStatusTypes } from '../data/AsyncDataset';

export const SequencingRepresentativenessChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateSelectorEncodedSchema,
    async (decoded: SequencingRepresentativenessChartProps) =>
      encodeLocationDateSelector(decoded.caseDataset.selector),
    async (encoded, signal) => {
      const selector = decodeLocationDateSelector(encoded);
      return {
        caseDataset: {
          selector,
          payload: (await CaseCountData.fromApi(selector, signal)).payload,
          status: AsyncStatusTypes.fulfilled,
        } as CaseCountAsyncDataset,
        sampleDataset: await DetailedSampleAggData.fromApi(decodeLocationDateSelector(encoded), signal),
      };
    }
  ),
  SequencingRepresentativenessChart,
  'SequencingRepresentativenessChart'
);
