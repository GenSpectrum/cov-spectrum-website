import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import {
  decodeLocationDateSelector,
  encodeLocationDateSelector,
  LocationDateSelectorEncodedSchema,
} from '../data/LocationDateSelector';
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { MetadataAvailabilityChart, MetadataAvailabilityChartProps } from './MetadataAvailabilityChart';

export const MetadataAvailabilityChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateSelectorEncodedSchema,
    async (decoded: MetadataAvailabilityChartProps) =>
      encodeLocationDateSelector(decoded.sampleSet.getSelector()),
    async (encoded, signal) => ({
      sampleSet: await DetailedSampleAggDataset.fromApi(decodeLocationDateSelector(encoded), signal),
    })
  ),
  MetadataAvailabilityChart,
  'MetadataAvailabilityChart'
);
