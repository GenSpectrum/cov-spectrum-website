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
import { AsyncStatusTypes } from '../data/AsyncDataset';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { DatelessCountrylessCountSampleData } from '../data/sample/DatelessCountrylessCountSampleDataset';
import { addDefaultHostAndQc } from '../data/HostAndQcSelector';

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
        sampleDataset: await DatelessCountrylessCountSampleData.fromApi(
          addDefaultHostAndQc({
            ...decodeLocationDateSelector(encoded),
            // TODO This is actually a bug. The sampling strategy filter should be applied
            samplingStrategy: SamplingStrategy.AllSamples,
          }),
          signal
        ),
      };
    }
  ),
  SequencingRepresentativenessChart,
  'SequencingRepresentativenessChart'
);
