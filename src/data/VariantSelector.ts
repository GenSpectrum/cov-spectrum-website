import * as zod from 'zod';

export const VariantSelectorEncodedSchema = zod.object({
  pangoLineage: zod.string().optional(),
  gisaidClade: zod.string().optional(),
  nextstrainClade: zod.string().optional(),
  aaMutations: zod.array(zod.string()).optional(),
  nucMutations: zod.array(zod.string()).optional(),
});

export type VariantSelector = zod.infer<typeof VariantSelectorEncodedSchema>;

export function encodeVariantSelector(selector: VariantSelector): VariantSelector {
  return selector;
}

export function decodeVariantSelector(encoded: VariantSelector): VariantSelector {
  return encoded;
}

export function addVariantSelectorToUrlSearchParams(selector: VariantSelector, params: URLSearchParams) {
  if (selector.aaMutations?.length) {
    params.set('aaMutations', selector.aaMutations.join(','));
  }
  if (selector.nucMutations?.length) {
    params.set('nucMutations', selector.nucMutations.join(','));
  }
  for (const k of ['pangoLineage', 'gisaidClade', 'nextstrainClade'] as const) {
    const value = selector[k];
    if (value !== undefined) {
      if (k === 'pangoLineage') {
        params.set('pangoLineage', value);
      } else {
        params.set(k, value);
      }
    }
  }
}

export function variantUrlFromSelector(selector: VariantSelector): string {
  const params = new URLSearchParams();
  addVariantSelectorToUrlSearchParams(selector, params);
  return params.toString();
}

export function variantIsOnlyDefinedBy(
  selector: VariantSelector,
  field: 'pangoLineage' | 'gisaidClade' | 'nextstrainClade' | 'aaMutations' | 'nucMutations'
): boolean {
  // The field is not undefined:
  if (selector[field] === undefined) {
    return false;
  }
  // Other fields are undefined:
  for (const f of [
    'pangoLineage',
    'gisaidClade',
    'nextstrainClade',
    'aaMutations',
    'nucMutations',
  ] as const) {
    const fieldValue = selector[f];
    if (f !== field && fieldValue !== undefined) {
      if (f === 'aaMutations' || f === 'nucMutations') {
        if (fieldValue.length === 0) {
          continue;
        }
      }
      return false;
    }
  }
  return true;
}

export function isValidPangoLineageQuery(query: string): boolean {
  return /^([A-Z]){1,2}(\.[0-9]{1,3})*(\.?\*)?$/.test(query.toUpperCase());
}

export function formatVariantDisplayName(
  { pangoLineage, gisaidClade, nextstrainClade, nucMutations, aaMutations }: VariantSelector,
  dense = false
): string {
  const components = [
    pangoLineage,
    gisaidClade,
    nextstrainClade,
    nucMutations?.join(', '),
    aaMutations?.join(', '),
  ].filter(c => !!c && c.length > 0);
  if (components.length === 0) {
    return 'All lineages';
  }
  return components.join(dense ? '+' : ' + ');
}
