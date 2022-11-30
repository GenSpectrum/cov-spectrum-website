import { useQuery } from '../../helpers/query-hook';
import { LapisSelector } from '../../data/LapisSelector';
import { addDefaultHostAndQc } from '../../data/HostAndQcSelector';
import { SamplingStrategy } from '../../data/SamplingStrategy';
import { MutationProportionData } from '../../data/MutationProportionDataset';
import { useMemo } from 'react';
import { formatVariantDisplayName, VariantSelector } from '../../data/VariantSelector';
import { LocationSelector } from '../../data/LocationSelector';
import { DateRangeSelector } from '../../data/DateRangeSelector';
import { MutationProportionEntry } from '../../data/MutationProportionEntry';
import {
  BaselineData,
  MutationColumnProperty,
  mutationColumnsProperties,
  MutationObject,
} from '../../data/mutationsOnCollectionPageData';
import { SequenceType } from '../../data/SequenceType';
import { sortMutationList } from '../../helpers/mutation';
import { pullAll } from '../../helpers/lodash_alternatives';

export function useMutationTableData(
  variants: { query: VariantSelector; name: string; description: string }[],
  locationSelector: LocationSelector,
  dateRangeSelector: DateRangeSelector,
  mutationType: SequenceType
) {
  const rawMutationData = useRawMutationData(variants, locationSelector, dateRangeSelector);

  return useMemo(() => {
    if (!rawMutationData) {
      return undefined;
    }

    return rawMutationData.map(mutationData => ({
      name: mutationData.name,
      query: mutationData.query,
      columns: mutationColumnsProperties.map(field => displayMutations(mutationData, mutationType, field)),
    }));
  }, [rawMutationData, mutationType]);
}

export function useBaselineMutationTableData(
  variants: { query: VariantSelector; name: string; description: string }[],
  locationSelector: LocationSelector,
  dateRangeSelector: DateRangeSelector,
  baselineVariant: VariantSelector,
  mutationType: SequenceType
) {
  const rawMutationData = useRawMutationData(variants, locationSelector, dateRangeSelector);
  const baselineData = useBaselineData(locationSelector, dateRangeSelector, baselineVariant);

  return useMemo(() => {
    if (!rawMutationData || !baselineData) {
      return undefined;
    }

    return rawMutationData.map(mutationData => ({
      name: mutationData.name,
      query: mutationData.query,
      additionalMutationColumns: mutationColumnsProperties.map(field =>
        displayMutationsAdditionalToBaselineMutations(mutationData, baselineData, mutationType, field)
      ),
      missingMutationColumns: mutationColumnsProperties.map(field =>
        displayMissingBaselineMutations(mutationData, baselineData, mutationType, field)
      ),
    }));
  }, [rawMutationData, baselineData, mutationType]);
}

function useRawMutationData(
  variants: { query: VariantSelector; name: string; description: string }[],
  locationSelector: LocationSelector,
  dateRangeSelector: DateRangeSelector
) {
  const mutations = useQuery(
    async signal => {
      if (!variants) {
        return undefined;
      }

      return await Promise.all(
        variants.map(variant => {
          const selector: LapisSelector = addDefaultHostAndQc({
            location: locationSelector,
            variant: variant.query,
            samplingStrategy: SamplingStrategy.AllSamples,
            dateRange: dateRangeSelector,
          });

          return Promise.all([
            MutationProportionData.fromApi(selector, 'aa', signal),
            MutationProportionData.fromApi(selector, 'nuc', signal),
          ]).then(async ([aaMutationDataset, nucMutationDataset]) => ({
            ...variant,
            aaMutations: aaMutationDataset.payload,
            nucMutations: nucMutationDataset.payload,
          }));
        })
      );
    },
    [variants, locationSelector, dateRangeSelector]
  );

  return useMemo(() => {
    if (mutations.data) {
      return mutations.data.map(variant => ({
        query: variant.query,
        name: variant.name.length > 0 ? variant.name : formatVariantDisplayName(variant.query),
        aaMutations: variant.aaMutations,
        nucMutations: variant.nucMutations,
      }));
    }
  }, [mutations]);
}

function useBaselineData(
  locationSelector: LocationSelector,
  dateRangeSelector: DateRangeSelector,
  baselineVariant?: VariantSelector
) {
  const baselineMutations = useQuery(
    signal => {
      const selector: LapisSelector = addDefaultHostAndQc({
        location: locationSelector,
        variant: baselineVariant,
        samplingStrategy: SamplingStrategy.AllSamples,
        dateRange: dateRangeSelector,
      });

      return Promise.all([
        MutationProportionData.fromApi(selector, 'aa', signal),
        MutationProportionData.fromApi(selector, 'nuc', signal),
      ]).then(([aaMutationDataset, nucMutationDataset]) => {
        return {
          aaMutations: aaMutationDataset.payload,
          nucMutations: nucMutationDataset.payload,
        };
      });
    },
    [baselineVariant, locationSelector, dateRangeSelector]
  );

  return baselineMutations.data;
}

const displayMutations = (
  item: MutationObject,
  mutationType: SequenceType,
  field: MutationColumnProperty
) => {
  const filteredMutations =
    mutationType === 'aa'
      ? filterMutations(item.aaMutations, field)
      : filterMutations(item.nucMutations, field);
  return sortMutationList(mutationType, getNames(filteredMutations)).join(', ');
};

const filterMutations = (mutations: MutationProportionEntry[], field: MutationColumnProperty) => {
  return mutations.filter(mutation => mutation.proportion > field.min && mutation.proportion <= field.max);
};

const getNames = (mutations: MutationProportionEntry[]) => {
  return mutations.map(item => item.mutation);
};

const displayMutationsAdditionalToBaselineMutations = (
  item: MutationObject,
  baselineData: BaselineData,
  mutationType: SequenceType,
  field: MutationColumnProperty
) => {
  const mutations = mutationType === 'aa' ? item.aaMutations : item.nucMutations;
  const filteredBaselineMutations =
    mutationType === 'aa'
      ? filterBaselineMutations(baselineData.aaMutations)
      : filterBaselineMutations(baselineData.nucMutations);

  return sortMutationList(
    mutationType,
    pullAll(getNames(filterMutations(mutations, field)), getNames(filteredBaselineMutations))
  ).join(', ');
};

const displayMissingBaselineMutations = (
  item: MutationObject,
  baselineData: BaselineData,
  mutationType: SequenceType,
  field: MutationColumnProperty
) => {
  const mutations = mutationType === 'aa' ? item.aaMutations : item.nucMutations;
  const filteredBaselineMutations =
    mutationType === 'aa'
      ? filterBaselineMutations(baselineData.aaMutations)
      : filterBaselineMutations(baselineData.nucMutations);

  return sortMutationList(
    mutationType,
    findMissingMutations(field.min, mutations, filteredBaselineMutations)
  ).join(', ');
};

const filterBaselineMutations = (mutations: MutationProportionEntry[]) => {
  return mutations.filter(mutation => mutation.proportion > 0.9);
};

const findMissingMutations = (
  min: number,
  mutations: MutationProportionEntry[],
  baselineMutations: MutationProportionEntry[]
) => {
  const minToProportionRange: { [min: number]: [number, number] } = {
    0.9: [0, 0.1],
    0.6: [0.1, 0.4],
    0.3: [0.4, 0.7],
    0.05: [0.7, 0.95],
  };

  const proportionRange = minToProportionRange[min];
  if (!proportionRange) {
    return [];
  }

  const filteredMutations = mutations.filter(
    mutation => mutation.proportion > proportionRange[0] && mutation.proportion <= proportionRange[1]
  );

  const filteredMutationNames = filteredMutations.map(item => item.mutation);
  const baselineMutationNames = baselineMutations.map(item => item.mutation);
  return commonElements(baselineMutationNames, filteredMutationNames);
};

function commonElements<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(function (element) {
    return arr2.indexOf(element) !== -1;
  });
}
