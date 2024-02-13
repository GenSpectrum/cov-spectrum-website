import * as zod from 'zod';
import jsonRefData from './refData.json';
import { mapFilterToLapisV2 } from './api-lapis-v2';

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
export type VariantField = (typeof variantFields)[number];
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
  for (const key of variantArrayFields) {
    const variantSelectors = selector[key];
    if (variantSelectors?.length) {
      const indexedKey = index && index > 0 ? `${key}${index}` : key;
      params.set(indexedKey, variantSelectors.join(','));
    }
  }
  addVariantStringFieldsToUrlSearchParams(selector, params, index);
}

export function addVariantSelectorToUrlSearchParamsForApi(
  selector: VariantSelector,
  params: URLSearchParams
) {
  for (const key of variantArrayFields) {
    const variantSelectors = selector[key];
    if (variantSelectors?.length) {
      const mappedKey = mapFilterToLapisV2(key);
      params.set(mappedKey, variantSelectors.join(','));
    }
  }
  addVariantStringFieldsToUrlSearchParams(selector, params);
}

function addVariantStringFieldsToUrlSearchParams(
  selector: VariantSelector,
  params: URLSearchParams,
  index?: number
) {
  for (const key of variantStringFields) {
    const variantSelector = selector[key];
    if (variantSelector !== undefined) {
      const indexedKey = index && index > 0 ? `${key}${index}` : key;
      params.set(indexedKey, variantSelector);
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

type Gene = {
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

// getting a 'clean' copy: https://stackoverflow.com/a/51681510
const loadRefData = () => JSON.parse(JSON.stringify(jsonRefData));

export const normalizeMutationName = (name: string) => {
  const refData = loadRefData();
  let items = name.split(':');
  if (name.toLowerCase().startsWith('ins_')) {
    // insertions
    return items.length === 3
      ? `ins_${formatGeneName(items[0].substring(4))}:${items[1]}:${items[2].toUpperCase()}` // AA insertions
      : `${items[0].toLowerCase()}:${items[1].toUpperCase()}`; // Nuc insertions
  } else {
    // mutations
    if (items.length === 1) {
      // Nuc mutations
      if (isNumeric(name[0])) {
        let refBase = refData.nucSeq[stripNumber(name) - 1];
        return `${refBase}${name}`.toUpperCase();
      }

      return name.toUpperCase();
    } else {
      // AA mutations
      const geneRefData = refData.genes.filter((gene: Gene) => gene.name === formatGeneName(items[0]))[0];
      if (!geneRefData) {
        // Unexpectedly, an unknown gene name was found.
        return name;
      }
      const refBase = geneRefData.aaSeq[stripNumber(items[1]) - 1];

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
    aaMutations && aaMutations.map(mutation => normalizeMutationName(mutation)).join(', '),
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
  if (components.length === 0) {
    // An empty variant query is considered as wrong and not as all-inclusive. We are therefore using this tautology
    // to get all samples.
    return 'B.1.1.7 | !B.1.1.7';
  }
  return components.join(' & ');
}

export function getPangoLineage(variant: VariantSelector) {
  return variant.pangoLineage
    ? variant.pangoLineage
    : variant.nextcladePangoLineage
    ? variant.nextcladePangoLineage
    : '';
}
