import { Widget } from '../../widgets/Widget';
import { ZodQueryEncoder } from '../../helpers/query-encoder';
import { SampleSelectorSchema } from '../../helpers/sample-selector';
import { Chen2021FitnessContainer } from './Chen2021FitnessContainer';

export const Chen2021FitnessWidget = new Widget(
  new ZodQueryEncoder(SampleSelectorSchema),
  Chen2021FitnessContainer,
  'Chen2021FitnessModel'
);
