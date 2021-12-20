import * as zod from 'zod';

export const VariantSelectorEncodedSchema = zod.object({
  pangoLineage: zod.string().optional(),
  gisaidClade: zod.string().optional(),
  nextstrainClade: zod.string().optional(),
  aaMutations: zod.array(zod.string()).optional(),
  nucMutations: zod.array(zod.string()).optional(),
  variantQuery: zod.string().optional(),
});

export type VariantSelector = zod.infer<typeof VariantSelectorEncodedSchema>;

export function encodeVariantSelector(selector: VariantSelector): VariantSelector {
  return selector;
}

export function decodeVariantSelector(encoded: VariantSelector): VariantSelector {
  return encoded;
}

export function addVariantSelectorToUrlSearchParams(
  selector: VariantSelector,
  params: URLSearchParams,
  index?: number
) {
  for (const k of ['pangoLineage', 'gisaidClade', 'nextstrainClade', 'variantQuery'] as const) {
    const value = selector[k];
    if (value !== undefined) {
      const key = index && index > 0 ? `${k}${index}` : k;
      params.set(key, value);
    }
  }
  if (selector.aaMutations?.length) {
    const aaMutationsKey = index && index > 0 ? `aaMutations${index}` : 'aaMutations';
    params.set(aaMutationsKey, selector.aaMutations.join(','));
  }
  if (selector.nucMutations?.length) {
    const nucMutationsKey = index && index > 0 ? `nucMutations${index}` : 'nucMutations';
    params.set(nucMutationsKey, selector.nucMutations.join(','));
  }
}

export function variantUrlFromSelector(selector: VariantSelector): string {
  const params = new URLSearchParams();
  addVariantSelectorToUrlSearchParams(selector, params);
  return params.toString();
}

export function variantListUrlFromSelectors(selectors: VariantSelector[]): string {
  const params = new URLSearchParams();
  selectors.forEach(function (selector, index) {
    addVariantSelectorToUrlSearchParams(selector, params, index);
  });
  return params.toString();
}

export function decodeVariantListFromUrl(query: string): VariantSelector[] {
  const params = query.split('&');
  const selectors: VariantSelector[] = [];
  params.forEach(param => {
    for (const k of [
      'aaMutations',
      'nucMutations',
      'pangoLineage',
      'gisaidClade',
      'nextstrainClade',
      'variantQuery',
    ] as const) {
      const regex = new RegExp(k + '(.*)=(.*)');
      const found = param.match(regex);
      if (found && found.length >= 3) {
        const index = found[1] ? parseInt(found[1]) : 0;
        const valueString = decodeURIComponent(found[2]);
        const value = k === 'aaMutations' || k === 'nucMutations' ? valueString.split(',') : valueString;
        let selector = selectors[index];
        if (selector) {
          selectors[index] = { ...selector, [k]: value };
        } else {
          selector = { [k]: value };
          selectors.splice(index, 0, selector);
        }
      }
    }
  });
  return selectors;
}

export function variantIsOnlyDefinedBy(
  selector: VariantSelector,
  field: 'pangoLineage' | 'gisaidClade' | 'nextstrainClade' | 'aaMutations' | 'nucMutations' | 'variantQuery'
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
    'variantQuery',
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
