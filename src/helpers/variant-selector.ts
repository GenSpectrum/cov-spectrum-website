import { NamedVariant, Variant } from '../services/api-types';
import { sortMutationList } from './mutation';

/**
 * A valid pangolin lineage query is a string in the pangolin lineage format, optionally followed by a ".*"
 * or "*".
 */
export function isValidPangolinLineageQuery(query: string): boolean {
  return /^([A-Z]){1,2}(\.[0-9]{1,3})*(\.?\*)?$/.test(query.toUpperCase());
}

/**
 * Return whether the variant is purely defined by pangolin lineages
 */
export function isPurePangolinLineage(variant: Variant): variant is NamedVariant {
  return !!variant.name && variant.mutations.length === 0;
}

/**
 * Return whether the variant is purely defined by mutations
 */
export function isPureMutations(variant: Variant): boolean {
  return !variant.name && variant.mutations.length > 0;
}

/**
 * Return whether the variant is defined both by pangolin lineages and mutations.
 */
export function isPangolinLineageWithMutations(variant: Variant): variant is NamedVariant {
  return !!variant.name && variant.mutations.length > 0;
}

export function formatVariantDisplayName(variant: Variant, dense = false): string {
  // If nothing is specified at all
  if (!variant.name && variant.mutations.length === 0) {
    return 'All lineages';
  }

  const plus = dense ? '+' : ' + ';
  return (
    (variant.name ?? '') +
    (isPangolinLineageWithMutations(variant) ? plus : '') +
    sortMutationList(variant.mutations).join(', ')
  );
}
