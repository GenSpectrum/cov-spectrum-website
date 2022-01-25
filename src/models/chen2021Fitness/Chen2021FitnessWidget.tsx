import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import { Widget } from '../../widgets/Widget';
import { Chen2021FitnessContainer, ContainerProps } from './Chen2021FitnessContainer';
import {
  decodeLocationDateVariantSelector,
  encodeLocationDateVariantSelector,
  LocationDateVariantSelectorEncodedSchema,
} from '../../data/LocationDateVariantSelector';
import { DateCountSampleData } from '../../data/sample/DateCountSampleDataset';

export const Chen2021FitnessWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateVariantSelectorEncodedSchema,
    async (v: ContainerProps) => encodeLocationDateVariantSelector(v.variantDateCounts.selector),
    async (encoded, signal) => {
      const variantSelector = decodeLocationDateVariantSelector(encoded);
      const wholeSelector = {
        ...variantSelector,
        variant: undefined,
      };
      return {
        variantDateCounts: await DateCountSampleData.fromApi(variantSelector, signal),
        wholeDateCounts: await DateCountSampleData.fromApi(wholeSelector, signal),
      };
    }
  ),
  Chen2021FitnessContainer,
  'Chen2021FitnessModel'
);
