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

export const SequencingRepresentativenessChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateSelectorEncodedSchema,
    async (decoded: SequencingRepresentativenessChartProps) =>
      encodeLocationDateSelector(decoded.caseDataset.getSelector()),
    async (encoded, signal) => ({
      caseDataset: await CaseCountDataset.fromApi(decodeLocationDateSelector(encoded), signal),
      sampleDataset: await DetailedSampleAggDataset.fromApi(decodeLocationDateSelector(encoded), signal),
    })
  ),
  SequencingRepresentativenessChart,
  'SequencingRepresentativenessChart'
);
