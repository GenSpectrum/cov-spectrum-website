import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import {
  SequencingRepresentativenessChart,
  SequencingRepresentativenessChartProps,
} from './SequencingRepresentativenessChart';
import {
  decodeLocationDateSelector,
  encodeLocationDateSelector,
  LocationDateSelector,
  LocationDateSelectorEncodedSchema,
} from '../data/LocationDateSelector';
import { CaseCountData } from '../data/CaseCountDataset';
import { DetailedSampleAggData } from '../data/sample/DetailedSampleAggDataset';
import { AsyncDataset, AsyncStatusTypes } from '../data/AsyncDataset';
import { CaseCountEntry } from '../data/CaseCountEntry';

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
        } as AsyncDataset<LocationDateSelector, CaseCountEntry[]>,
        sampleDataset: await DetailedSampleAggData.fromApi(decodeLocationDateSelector(encoded), signal),
      };
    }
  ),
  SequencingRepresentativenessChart,
  'SequencingRepresentativenessChart'
);
