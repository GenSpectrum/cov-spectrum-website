import { MutationProportionEntry } from './MutationProportionEntry';
import { VariantSelector } from './VariantSelector';

export interface MutationColumnProperty {
  min: number;
  max: number;
  label: string;
}

export interface MutationObject {
  query: VariantSelector;
  name: string;
  aaMutations: MutationProportionEntry[];
  nucMutations: MutationProportionEntry[];
}

export const mutationColumnsProperties = [
  { min: 0.9, max: 1, label: '>90%' },
  { min: 0.6, max: 0.9, label: '60-90%' },
  { min: 0.3, max: 0.6, label: '30-60%' },
  { min: 0.05, max: 0.3, label: '5-30%' },
] as const;

export interface BaselineData {
  aaMutations: MutationProportionEntry[];
  nucMutations: MutationProportionEntry[];
}
