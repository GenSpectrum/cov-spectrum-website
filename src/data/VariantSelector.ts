import * as zod from 'zod';

export const VariantSelectorEncodedSchema = zod.object({
  pangoLineage: zod.string().optional(),
  gisaidClade: zod.string().optional(),
  nextstrainClade: zod.string().optional(),
  aaMutations: zod.array(zod.string()).optional(),
  nucMutations: zod.array(zod.string()).optional(),
  aaInsertions: zod.array(zod.string()).optional(),
  nucInsertions: zod.array(zod.string()).optional(),
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
  for (const k of ['aaMutations', 'nucMutations', 'aaInsertions', 'nucInsertions'] as const) {
    const arr = selector[k];
    if (arr?.length) {
      const key = index && index > 0 ? `${k}${index}` : k;
      params.set(key, arr.join(','));
    }
  }
  for (const k of ['pangoLineage', 'gisaidClade', 'nextstrainClade', 'variantQuery'] as const) {
    const value = selector[k];
    if (value !== undefined) {
      const key = index && index > 0 ? `${k}${index}` : k;
      params.set(key, value);
    }
  }
}

export function addVariantSelectorsToUrlSearchParams(selectors: VariantSelector[], params: URLSearchParams) {
  removeVariantSelectorsFromUrlSearchParams(params);
  selectors.forEach(function (selector, index) {
    addVariantSelectorToUrlSearchParams(selector, params, index);
  });
}

function removeVariantSelectorsFromUrlSearchParams(params: URLSearchParams) {
  for (const key of [...params.keys()]) {
    if (
      key.startsWith('aaMutations') ||
      key.startsWith('nucMutations') ||
      key.startsWith('aaInsertions') ||
      key.startsWith('nucInsertions') ||
      key.startsWith('pangoLineage') ||
      key.startsWith('gisaidClade') ||
      key.startsWith('nextstrainClade') ||
      key.startsWith('variantQuery')
    ) {
      params.delete(key);
    }
  }
}

export function readVariantListFromUrlSearchParams(params: URLSearchParams): VariantSelector[] {
  // Find out how many variants are specified and which index/ID they have.
  const variantIds = new Set<number>();
  for (let key of params.keys()) {
    // The number in "aaMutations1", "pangoLineage3", ... should be parsed out.
    const match = key.match(
      /(pangoLineage|gisaidClade|nextstrainClade|aaMutations|nucMutations|aaInsertions|nucInsertions|variantQuery)(\d+)/
    );
    if (match) {
      variantIds.add(Number.parseInt(match[2]));
    }
  }
  // Create the variant selectors.
  const variants: VariantSelector[] = [
    {
      pangoLineage: params.get('pangoLineage') ?? undefined,
      gisaidClade: params.get('gisaidClade') ?? undefined,
      nextstrainClade: params.get('nextstrainClade') ?? undefined,
      aaMutations: params.get('aaMutations')?.split(','),
      nucMutations: params.get('nucMutations')?.split(','),
      aaInsertions: params.get('aaInsertions')?.split(','),
      nucInsertions: params.get('nucInsertions')?.split(','),
      variantQuery: params.get('variantQuery') ?? undefined,
    },
  ];
  for (let id of variantIds) {
    variants.push({
      pangoLineage: params.get('pangoLineage' + id) ?? undefined,
      gisaidClade: params.get('gisaidClade' + id) ?? undefined,
      nextstrainClade: params.get('nextstrainClade' + id) ?? undefined,
      aaMutations: params.get('aaMutations' + id)?.split(','),
      nucMutations: params.get('nucMutations' + id)?.split(','),
      aaInsertions: params.get('aaInsertions' + id)?.split(','),
      nucInsertions: params.get('nucInsertions' + id)?.split(','),
      variantQuery: params.get('variantQuery' + id) ?? undefined,
    });
  }
  return variants;
}

export function variantIsOnlyDefinedBy(
  selector: VariantSelector,
  field:
    | 'pangoLineage'
    | 'gisaidClade'
    | 'nextstrainClade'
    | 'aaMutations'
    | 'nucMutations'
    | 'aaInsertions'
    | 'nucInsertions'
    | 'variantQuery'
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
    'aaInsertions',
    'nucInsertions',
    'variantQuery',
  ] as const) {
    const fieldValue = selector[f];
    if (f !== field && fieldValue !== undefined) {
      if (f === 'aaMutations' || f === 'nucMutations' || f === 'aaInsertions' || f === 'nucInsertions') {
        if (fieldValue.length === 0) {
          continue;
        }
      }
      return false;
    }
  }
  return true;
}

/**
 * Returns true if no filter is set
 */
export function variantIsAllLineages(selector: VariantSelector): boolean {
  // Other fields are undefined:
  for (const f of [
    'pangoLineage',
    'gisaidClade',
    'nextstrainClade',
    'aaMutations',
    'nucMutations',
    'aaInsertions',
    'nucInsertions',
    'variantQuery',
  ] as const) {
    const fieldValue = selector[f];
    if (fieldValue !== undefined) {
      if (
        f === 'aaMutations' ||
        f === 'nucMutations' ||
        f === 'aaInsertions' ||
        f === 'nucInsertions' ||
        f === 'variantQuery'
      ) {
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
  {
    pangoLineage,
    gisaidClade,
    nextstrainClade,
    nucMutations,
    aaMutations,
    nucInsertions,
    aaInsertions,
    variantQuery,
  }: VariantSelector,
  dense = false
): string {
  if (variantQuery) {
    return variantQuery;
  }
  const components = [
    pangoLineage,
    gisaidClade,
    nextstrainClade,
    nucMutations?.join(', '),
    aaMutations?.join(', '),
    nucInsertions?.join(', '),
    aaInsertions?.join(', '),
  ].filter(c => !!c && c.length > 0);
  if (components.length === 0) {
    return 'All lineages';
  }
  return components.join(dense ? '+' : ' + ');
}

export function transformToVariantQuery(selector: VariantSelector): string {
  if (selector.variantQuery) {
    return selector.variantQuery;
  }
  const components = [
    selector.pangoLineage,
    selector.nextstrainClade ? `nextstrain:${selector.nextstrainClade}` : undefined,
    selector.gisaidClade ? `gisaid:${selector.gisaidClade}` : undefined,
    ...(selector.aaMutations ?? []),
    ...(selector.nucMutations ?? []),
    ...(selector.aaInsertions ?? []),
    ...(selector.nucInsertions ?? []),
  ].filter(c => !!c) as string[];
  return components.join(' & ');
}
