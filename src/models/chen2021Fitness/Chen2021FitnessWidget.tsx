import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import * as zod from 'zod';
import { Widget } from '../../widgets/Widget';
import { Chen2021FitnessContainer, ContainerProps } from './Chen2021FitnessContainer';
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

export const Chen2021FitnessWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      location: LocationSelectorEncodedSchema,
      variant: VariantSelectorEncodedSchema,
    }),
    async (v: ContainerProps) => ({
      location: encodeLocationSelector(v.locationSelector),
      variant: encodeVariantSelector(v.variantSelector),
      samplingStrategy: v.samplingStrategy,
    }),
    async v => ({
      locationSelector: decodeLocationSelector(v.location),
      variantSelector: decodeVariantSelector(v.variant),
      samplingStrategy: decodeSamplingStrategy(v.samplingStrategy) ?? SamplingStrategy.AllSamples,
    })
  ),
  Chen2021FitnessContainer,
  'Chen2021FitnessModel'
);
