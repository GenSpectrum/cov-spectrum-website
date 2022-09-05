import * as zod from 'zod';

export const VariantSelectorEncodedSchema = zod.object({
  pangoLineage: zod.string().optional(),
  nextcladePangoLineage: zod.string().optional(),
  gisaidClade: zod.string().optional(),
  nextstrainClade: zod.string().optional(),
  aaMutations: zod.array(zod.string()).optional(),
  nucMutations: zod.array(zod.string()).optional(),
  aaInsertions: zod.array(zod.string()).optional(),
  nucInsertions: zod.array(zod.string()).optional(),
  variantQuery: zod.string().optional(),
});

export type VariantSelector = zod.infer<typeof VariantSelectorEncodedSchema>;

export const variantFields = [
  'pangoLineage',
  'nextcladePangoLineage',
  'gisaidClade',
  'nextstrainClade',
  'aaMutations',
  'nucMutations',
  'aaInsertions',
  'nucInsertions',
  'variantQuery',
] as const;
export type VariantField = typeof variantFields[number];
const variantStringFields = [
  'pangoLineage',
  'nextcladePangoLineage',
  'gisaidClade',
  'nextstrainClade',
  'variantQuery',
] as const;
const variantArrayFields = ['aaMutations', 'nucMutations', 'aaInsertions', 'nucInsertions'] as const;

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
  for (const k of variantArrayFields) {
    const arr = selector[k];
    if (arr?.length) {
      const key = index && index > 0 ? `${k}${index}` : k;
      params.set(key, arr.join(','));
    }
  }
  for (const k of variantStringFields) {
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
    for (const field of variantFields) {
      if (key.startsWith(field)) {
        params.delete(key);
        break;
      }
    }
  }
}

export function readVariantListFromUrlSearchParams(params: URLSearchParams): VariantSelector[] {
  // Find out how many variants are specified and which index/ID they have.
  const variantIds = new Set<number>();
  for (let key of params.keys()) {
    // The number in "aaMutations1", "pangoLineage3", ... should be parsed out.
    const match = key.match(
      /(pangoLineage|nextcladePangoLineage|gisaidClade|nextstrainClade|aaMutations|nucMutations|aaInsertions|nucInsertions|variantQuery)(\d+)/
    );
    if (match) {
      variantIds.add(Number.parseInt(match[2]));
    }
  }
  // Create the variant selectors.
  const variants: VariantSelector[] = [
    {
      pangoLineage: params.get('pangoLineage') ?? undefined,
      nextcladePangoLineage: params.get('nextcladePangoLineage') ?? undefined,
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
      nextcladePangoLineage: params.get('nextcladePangoLineage' + id) ?? undefined,
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

export function variantIsOnlyDefinedBy(selector: VariantSelector, field: VariantField): boolean {
  // The field is not undefined:
  if (selector[field] === undefined) {
    return false;
  }
  // Other fields are undefined:
  for (const f of variantFields) {
    const fieldValue = selector[f];
    if (f !== field && fieldValue !== undefined) {
      if (variantArrayFields.includes(f as any)) {
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
  // All fields are undefined:
  for (const f of variantFields) {
    const fieldValue = selector[f];
    if (fieldValue !== undefined) {
      if (variantArrayFields.includes(f as any)) {
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
  return /^([A-Z]){1,3}(\.[0-9]{1,3})*(\.?\*)?$/.test(query.toUpperCase());
}

const joinNucMutations = (mutations: string[]): string => {
  return mutations.map(i => i.toUpperCase).join(', ');
};

//ins_22204:?GAG?GAG?GAA?
const joinAAMutations = (mutations: string[]): string => {
  return mutations
    .map(i => {
      let items = i.split(':');
      let gene =
        items[0].length === 1
          ? items[0].toUpperCase()
          : items[0].substring(0, items[0].length - 1).toUpperCase() + items[0].slice(-1).toLowerCase();
      return gene + ':' + items[1].toUpperCase();
    })
    .join(', ');
};

const joinAAInsertions = (insertions: string[]): string => {
  // e. g. ins_S:214:EPE
  return insertions
    .map(i => {
      let items = i.split(':');
      let gene = items[0].substring(4);
      gene =
        gene.length === 1
          ? gene.toUpperCase()
          : gene.substring(0, gene.length - 1).toUpperCase() + gene.slice(-1).toLowerCase();
      return 'ins_' + gene + ':' + items[1] + ':' + items[2].toUpperCase();
    })
    .join(', ');
};

const joinNucInsertions = (insertions: string[]): string => {
  // e. g. ins_22204:?GAG?GAG?GAA?
  return insertions
    .map(i => {
      let items = i.split(':');
      return items[0].toLowerCase() + ':' + items[1].toUpperCase();
    })
    .join(', ');
};

export function formatVariantDisplayName(
  {
    pangoLineage,
    nextcladePangoLineage,
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
    pangoLineage?.toUpperCase(),
    nextcladePangoLineage ? nextcladePangoLineage.toUpperCase() + ' (Nextclade)' : undefined,
    gisaidClade ? gisaidClade.toUpperCase() + ' (GISAID clade)' : undefined,
    nextstrainClade ? nextstrainClade.toUpperCase() + ' (Nextstrain clade)' : undefined,
    nucMutations && joinNucMutations(nucMutations),
    aaMutations && joinAAMutations(aaMutations),
    nucInsertions && joinNucInsertions(nucInsertions),
    aaInsertions && joinAAInsertions(aaInsertions),
  ].filter(c => !!c && c.length > 0);
  if (components.length === 0) {
    return 'All lineages';
  }
  console.log('!!!!!!!!!!!!!!!!!');
  console.log('NUC INSERTIONS', nucInsertions);
  console.log('AA INSERTIONS', aaInsertions);
  console.log(components.join(dense ? '+' : ' + '));
  return components.join(dense ? '+' : ' + ');
}

export function transformToVariantQuery(selector: VariantSelector): string {
  if (selector.variantQuery) {
    return selector.variantQuery;
  }
  const components = [
    selector.pangoLineage,
    selector.nextcladePangoLineage ? `nextcladePangoLineage:${selector.nextcladePangoLineage}` : undefined,
    selector.nextstrainClade ? `nextstrainClade:${selector.nextstrainClade}` : undefined,
    selector.gisaidClade ? `gisaid:${selector.gisaidClade}` : undefined,
    ...(selector.aaMutations ?? []),
    ...(selector.nucMutations ?? []),
    ...(selector.aaInsertions ?? []),
    ...(selector.nucInsertions ?? []),
  ].filter(c => !!c) as string[];
  return components.join(' & ');
}
