import * as zod from 'zod';
import refData from './refData';

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

const stripNumber = (str: string) => Number.parseInt(str.replace(/\D+/g, ''));
const isNumeric = (str: string) => /^\d+$/.test(str);

type geneType = {
  name: string;
  startPosition: number;
  endPosition: number;
  aaSeq: string;
};

const formatGeneName = (gene: string): string => {
  return gene.length === 1
    ? gene.toUpperCase()
    : gene.slice(0, -1).toUpperCase() + gene.slice(-1).toLowerCase();
};

export const normalizeMutationName = (name: string) => {
  let items = name.split(':');
  if (name.toLowerCase().startsWith('ins_')) {
    return items.length === 3
      ? `ins_${formatGeneName(items[0].substring(4))}:${items[1]}:${items[2].toUpperCase()}`
      : `${items[0].toLowerCase()}:${items[1].toUpperCase()}`;
  } else {
    if (items.length === 1) {
      if (isNumeric(name[0])) {
        let refBase = refData.nucSeq[stripNumber(name) - 1];
        return `${refBase}${name}`.toUpperCase();
      }

      return name.toUpperCase();
    } else {
      let refBase = refData.genes
        .filter((gene: geneType) => gene.name === formatGeneName(items[0]))[0]
        .aaSeq.toString()[stripNumber(items[1]) - 1];

      return `${formatGeneName(items[0])}:${isNumeric(items[1][0]) ? refBase : ''}${items[1].toUpperCase()}`;
    }
  }
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
    nucMutations && nucMutations.map(mutation => normalizeMutationName(mutation)).join(', '),
    aaMutations && aaMutations.map(mutation => normalizeMutationName(mutation)).join(', '), // normalizeMutationName(mutation)).join(', ')
    nucInsertions && nucInsertions.map(mutation => normalizeMutationName(mutation)).join(', '),
    aaInsertions && aaInsertions.map(mutation => normalizeMutationName(mutation)).join(', '),
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
