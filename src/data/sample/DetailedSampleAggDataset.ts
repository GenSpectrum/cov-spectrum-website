import { Dataset } from '../Dataset';
import { LocationDateVariantSelector } from '../LocationDateVariantSelector';
import { DetailedSampleAggEntry } from './DetailedSampleAggEntry';

export type DetailedSampleAggDataset = Dataset<LocationDateVariantSelector, DetailedSampleAggEntry[]>;
