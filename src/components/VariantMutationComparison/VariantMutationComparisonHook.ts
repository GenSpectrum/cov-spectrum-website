import { pullAll } from '../../helpers/lodash_alternatives';
import { MutationProportionEntry } from '../../data/MutationProportionEntry';
import { ReferenceGenomeService } from '../../services/ReferenceGenomeService';
import { LapisSelector } from '../../data/LapisSelector';
import { useQuery } from '../../helpers/query-hook';
import { MutationProportionData } from '../../data/MutationProportionDataset';
import { useEffect, useMemo } from 'react';

export function useOverlappingData(selectors: LapisSelector[], minProportion: number) {
  const selectedVariants = useQuery(
    signal => Promise.all(selectors.map(selector => MutationProportionData.fromApi(selector, 'aa', signal))),
    [selectors],
    useEffect
  );
  const overlappingData = useMemo(() => {
    if (!selectedVariants || !selectedVariants.data || selectedVariants.data.length !== 2) {
      return undefined;
    }
    const [mutationsFromVariant1, mutationsFromVariant2] = selectedVariants.data.map(v =>
      selectMutationByProportion(v.payload, minProportion)
    );
    const { sharedMutations, mutationsOnlyInVariant1, mutationsOnlyInVariant2 } = findSharedMutations(
      mutationsFromVariant1,
      mutationsFromVariant2
    );
    const genes = groupByGenes(sharedMutations, mutationsOnlyInVariant1, mutationsOnlyInVariant2);
    // Count
    return [...genes.entries()].map(([gene, mutations]) => ({
      gene,
      ...mutations,
    }));
  }, [selectedVariants, minProportion]);

  if (selectors.length !== 2) {
    throw new Error(
      `<VariantMutationComparison> is used with ${selectors.length} variants, ` +
        'but it only supports comparisons of 2 variants.'
    );
  }

  if (selectedVariants.isError) {
    throw new Error('Data fetching failed: ' + JSON.stringify(selectedVariants.error));
  }

  return selectedVariants.isLoading ? 'loading' : overlappingData;
}

function findSharedMutations(mutations1: string[], mutations2: string[]) {
  const sharedMutations = [mutations1, mutations2].reduce((a, b) => a.filter(c => b.includes(c)));
  const mutationsOnlyInVariant1: string[] = pullAll(mutations1, sharedMutations);
  const mutationsOnlyInVariant2: string[] = pullAll(mutations2, sharedMutations);
  return { sharedMutations, mutationsOnlyInVariant1, mutationsOnlyInVariant2 };
}

function selectMutationByProportion(variant: MutationProportionEntry[], minProportion: number) {
  return variant.filter(m => m.proportion >= minProportion).map(m => m.mutation);
}

function groupByGenes(
  sharedMutations: string[],
  mutationsOnlyInVariant1: string[],
  mutationsOnlyInVariant2: string[]
) {
  const genes = new Map<
    string,
    {
      mutationsOnlyIn1: string[];
      mutationsOnlyIn2: string[];
      sharedMutations: string[];
    }
  >();
  for (let gene of ReferenceGenomeService.genes) {
    genes.set(gene, { mutationsOnlyIn1: [], mutationsOnlyIn2: [], sharedMutations: [] });
  }
  for (let mutation of sharedMutations) {
    genes.get(mutation.split(':')[0])!.sharedMutations.push(mutation);
  }
  for (let mutation of mutationsOnlyInVariant1) {
    genes.get(mutation.split(':')[0])!.mutationsOnlyIn1.push(mutation);
  }
  for (let mutation of mutationsOnlyInVariant2) {
    genes.get(mutation.split(':')[0])!.mutationsOnlyIn2.push(mutation);
  }
  return genes;
}
