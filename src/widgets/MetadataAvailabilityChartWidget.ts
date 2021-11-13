import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import {
  decodeLocationDateSelector,
  encodeLocationDateSelector,
  LocationDateSelectorEncodedSchema,
} from '../data/LocationDateSelector';
import { DetailedSampleAggData } from '../data/sample/DetailedSampleAggDataset';
import { MetadataAvailabilityChart, MetadataAvailabilityChartProps } from './MetadataAvailabilityChart';

export const MetadataAvailabilityChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateSelectorEncodedSchema,
    async (decoded: MetadataAvailabilityChartProps) => encodeLocationDateSelector(decoded.sampleSet.selector),
    async (encoded, signal) => ({
      sampleSet: await DetailedSampleAggData.fromApi(decodeLocationDateSelector(encoded), signal),
    })
  ),
  MetadataAvailabilityChart,
  'MetadataAvailabilityChart'
);
