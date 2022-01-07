import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import {
  decodeLocationDateSelector,
  encodeLocationDateSelector,
  LocationDateSelectorEncodedSchema,
} from '../data/LocationDateSelector';
import { MetadataAvailabilityChart, MetadataAvailabilityChartProps } from './MetadataAvailabilityChart';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { DatelessCountrylessCountSampleData } from '../data/sample/DatelessCountrylessCountSampleDataset';

export const MetadataAvailabilityChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateSelectorEncodedSchema,
    async (decoded: MetadataAvailabilityChartProps) => encodeLocationDateSelector(decoded.sampleSet.selector),
    async (encoded, signal) => ({
      sampleSet: await DatelessCountrylessCountSampleData.fromApi(
        {
          ...decodeLocationDateSelector(encoded),
          // TODO This is actually a bug. The sampling strategy filter should be applied
          samplingStrategy: SamplingStrategy.AllSamples,
        },
        signal
      ),
    })
  ),
  MetadataAvailabilityChart,
  'MetadataAvailabilityChart'
);
