import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import { SampleSelectorSchema } from '../../helpers/sample-selector';
import { Widget } from '../../widgets/Widget';
import { Chen2021FitnessContainer, ContainerProps } from './Chen2021FitnessContainer';

export const Chen2021FitnessWidget = new Widget(
  new AsyncZodQueryEncoder(
    SampleSelectorSchema,
    async (v: ContainerProps) => v,
    async v => v
  ),
  Chen2021FitnessContainer,
  'Chen2021FitnessModel'
);
