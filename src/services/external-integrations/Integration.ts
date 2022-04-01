import { LocationDateVariantSelector } from '../../data/LocationDateVariantSelector';
import { variantIsOnlyDefinedBy } from '../../data/VariantSelector';
import { LapisSelector } from '../../data/LapisSelector';

export interface Integration {
  name: string;
  isAvailable(selector: LapisSelector): boolean;
  open(selector: LapisSelector): void;
}

/**
 * If the variant is only defined by a single pango lineage, return the lineage; otherwise undefined.
 */
export function getPangoLineageIfPure(selector: LocationDateVariantSelector): string | undefined {
  if (!selector.variant || !variantIsOnlyDefinedBy(selector.variant, 'pangoLineage')) {
    return undefined;
  }
  return selector.variant.pangoLineage;
}

/**
 * If the variant is only defined by a set of mutations, return the mutations; otherwise undefined.
 */
export function getAAMutationsIfPure(selector: LocationDateVariantSelector): string[] | undefined {
  if (!selector.variant || !variantIsOnlyDefinedBy(selector.variant, 'aaMutations')) {
    return undefined;
  }
  return selector.variant.aaMutations;
}
