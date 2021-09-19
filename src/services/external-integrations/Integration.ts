import { Variant } from '../api-types';
import { LiteralSamplingStrategy } from '../api';
import { isPureMutations, isPurePangolinLineage } from '../../helpers/variant-selector';

export type IntegrationSelector = {
  variant: Variant;
  matchPercentage: number;
  country: string | undefined | null;
  samplingStrategy: LiteralSamplingStrategy;
};

export interface Integration {
  name: string;
  isAvailable(selector: IntegrationSelector): boolean;
  open(selector: IntegrationSelector): void;
}

/**
 * If the variant is only defined by a single pangolin lineage, return the lineage; otherwise undefined.
 */
export function getPangolinLineageIfPure(selector: IntegrationSelector): string | undefined {
  if (isPurePangolinLineage(selector.variant) && !selector.variant.name.endsWith('*')) {
    return selector.variant.name;
  } else {
    return undefined;
  }
}

/**
 * If the variant is only defined by a set of mutations, return the mutations; otherwise undefined.
 */
export function getMutationsIfPure(selector: IntegrationSelector): string[] | undefined {
  if (isPureMutations(selector.variant)) {
    return selector.variant.mutations;
  } else {
    return undefined;
  }
}
