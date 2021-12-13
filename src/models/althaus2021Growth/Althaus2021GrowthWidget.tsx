import { Widget } from '../../widgets/Widget';
import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import * as zod from 'zod';
import {
  decodeLocationSelector,
  encodeLocationSelector,
  LocationSelectorEncodedSchema,
} from '../../data/LocationSelector';
import {
  decodeVariantSelector,
  encodeVariantSelector,
  VariantSelectorEncodedSchema,
} from '../../data/VariantSelector';
import { decodeSamplingStrategy, SamplingStrategy } from '../../data/SamplingStrategy';
import { Althaus2021GrowthContainer, ContainerProps } from './Althaus2021GrowthContainer';
import { decodeDateRangeSelector, encodeDateRangeSelector } from '../../data/DateRangeSelector';

export const Althaus2021GrowthWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      location: LocationSelectorEncodedSchema,
      variant: VariantSelectorEncodedSchema,
    }),
    async (v: ContainerProps) => ({
      location: encodeLocationSelector(v.locationSelector),
      dateRange: encodeDateRangeSelector(v.dateRangeSelector),
      variant: encodeVariantSelector(v.variantSelector),
      samplingStrategy: v.samplingStrategy,
    }),
    async v => ({
      locationSelector: decodeLocationSelector(v.location),
      dateRangeSelector: decodeDateRangeSelector(v.dateRange),
      variantSelector: decodeVariantSelector(v.variant),
      samplingStrategy: decodeSamplingStrategy(v.samplingStrategy) ?? SamplingStrategy.AllSamples,
    })
  ),
  Althaus2021GrowthContainer,
  'Althaus2021GrowthModel'
);
