import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MutationName } from './MutationName';
import { sortListByAAMutation } from '../helpers/aa-mutation';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { MutationProportionDataset } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionEntry } from '../data/MutationProportionEntry';
import { fetchSamplesCount } from '../data/api-lapis';
import { SequenceType } from '../data/SequenceType';
import { VariantSelector } from '../data/VariantSelector';
import { PromiseQueue } from '../helpers/PromiseQueue';

export interface Props {
  selector: LocationDateVariantSelector;
}

const MutationList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const MutationEntry = styled.li`
  width: 250px;
`;

const sortOptions = ['position', 'proportion', 'uniqueness'] as const;
const sortOptionCssClass = {
  position: '',
  proportion: 'font-bold text-yellow-700',
  uniqueness: 'font-bold text-indigo-600',
};
const sortOptionLabels = {
  position: 'position',
  proportion: 'proportion',
  uniqueness: 'Jaccard similarity',
};
type SortOptions = typeof sortOptions[number];

type MutationUniquenessMap = {
  [key: string]: number | undefined;
};

export const VariantMutations = ({ selector }: Props) => {
  const [commonAAMutationsSort, setCommonAAMutationsSort] = useState<SortOptions>('position');
  const [commonNucMutationsSort, setCommonNucMutationsSort] = useState<SortOptions>('position');
  const [aaMutationUniqueness, setAAMutationUniqueness] = useState<MutationUniquenessMap>({});
  const [nucMutationUniqueness, setNucMutationUniqueness] = useState<MutationUniquenessMap>({});

  const queryStatus = useQuery(
    signal =>
      Promise.all([
        fetchSamplesCount(selector, signal),
        MutationProportionDataset.fromApi(selector, 'aa', signal),
        MutationProportionDataset.fromApi(selector, 'nuc', signal),
      ]).then(([variantCount, aaMutationDataset, nucMutationDataset]) => {
        return {
          variantCount,
          aa: aaMutationDataset.getPayload(),
          nuc: nucMutationDataset.getPayload(),
        };
      }),
    [selector]
  );

  useEffect(() => {
    if (!queryStatus.data) {
      return;
    }
    const { aa, nuc, variantCount } = queryStatus.data;
    // aa
    // We use a PromiseQueue because fetching the count of all mutations can be very costly (for the server).
    const aaFetchQueue = new PromiseQueue();
    for (let aaElement of aa) {
      aaFetchQueue.addTask(() =>
        fetchUniquenessScore(aaElement, selector, variantCount, 'aa').then(uniqueness =>
          setAAMutationUniqueness(prev => ({
            ...prev,
            [aaElement.mutation]: uniqueness,
          }))
        )
      );
    }
    // nuc
    const nucFetchQueue = new PromiseQueue();
    for (let nucElement of nuc) {
      nucFetchQueue.addTask(() =>
        fetchUniquenessScore(nucElement, selector, variantCount, 'nuc').then(uniqueness =>
          setNucMutationUniqueness(prev => ({
            ...prev,
            [nucElement.mutation]: uniqueness,
          }))
        )
      );
    }
  }, [queryStatus.data, selector]);

  if (queryStatus.isLoading || !queryStatus.data) {
    return <Loader />;
  }
  const data = queryStatus.data;

  return (
    <>
      <div>
        The following (amino acid) mutations are present in at least 5% of the sequences of this variant:
      </div>
      <div className='ml-4'>
        {sortOptions.map((opt, index) => (
          <>
            {index > 0 && <> | </>}
            <span
              key={opt}
              className={commonAAMutationsSort === opt ? 'font-bold' : 'underline cursor-pointer'}
              onClick={() => setCommonAAMutationsSort(opt)}
            >
              Sort by <span className={sortOptionCssClass[opt]}>{sortOptionLabels[opt]}</span>
            </span>{' '}
          </>
        ))}
      </div>
      <MutationList className='list-disc'>
        {sortAAMutations(data.aa, commonAAMutationsSort, aaMutationUniqueness).map(
          ({ mutation, proportion }) => {
            return (
              <MutationEntry key={mutation}>
                <MutationName mutation={mutation} /> (<Proportion value={proportion} />,{' '}
                <Uniqueness value={aaMutationUniqueness[mutation]} />)
              </MutationEntry>
            );
          }
        )}
      </MutationList>
      <div className='mt-4'>
        The following nucleotide mutations are present in at least 5% of the sequences of this variant
        (leading and tailing deletions are excluded):
      </div>
      <div className='ml-4'>
        {sortOptions.map((opt, index) => (
          <>
            {index > 0 && <> | </>}
            <span
              key={opt}
              className={commonNucMutationsSort === opt ? 'font-bold' : 'underline cursor-pointer'}
              onClick={() => setCommonNucMutationsSort(opt)}
            >
              Sort by <span className={sortOptionCssClass[opt]}>{sortOptionLabels[opt]}</span>
            </span>{' '}
          </>
        ))}
      </div>
      <MutationList className='list-disc'>
        {sortNucMutations(data.nuc, commonNucMutationsSort, nucMutationUniqueness).map(
          ({ mutation, proportion }) => {
            return (
              <MutationEntry key={mutation}>
                {mutation} (<Proportion value={proportion} />,{' '}
                <Uniqueness value={nucMutationUniqueness[mutation]} />)
              </MutationEntry>
            );
          }
        )}
      </MutationList>
    </>
  );
};

const sortAAMutations = (
  entries: MutationProportionEntry[],
  sortOption: SortOptions,
  uniquenessMap: MutationUniquenessMap
): MutationProportionEntry[] => {
  switch (sortOption) {
    case 'proportion':
      return [...entries].sort((a, b) => b.proportion - a.proportion);
    case 'position':
      return sortListByAAMutation(entries, x => x.mutation);
    case 'uniqueness':
      return [...entries].sort((a, b) => {
        if (uniquenessMap[a.mutation] === undefined && uniquenessMap[b.mutation] === undefined) {
          return 0;
        }
        if (uniquenessMap[a.mutation] === undefined) {
          return 1;
        }
        if (uniquenessMap[b.mutation] === undefined) {
          return -1;
        }
        return uniquenessMap[b.mutation]! - uniquenessMap[a.mutation]!;
      });
  }
};

const sortNucMutations = (
  entries: MutationProportionEntry[],
  sortOption: SortOptions,
  uniquenessMap: MutationUniquenessMap
): MutationProportionEntry[] => {
  return [...entries].sort((a, b) => {
    switch (sortOption) {
      case 'proportion':
        return b.proportion - a.proportion;
      case 'position':
        return (
          parseInt(a.mutation.substr(1, a.mutation.length - 2)) -
          parseInt(b.mutation.substr(1, b.mutation.length - 2))
        );
      case 'uniqueness':
        if (uniquenessMap[a.mutation] === undefined && uniquenessMap[b.mutation] === undefined) {
          return 0;
        }
        if (uniquenessMap[a.mutation] === undefined) {
          return 1;
        }
        if (uniquenessMap[b.mutation] === undefined) {
          return -1;
        }
        return uniquenessMap[b.mutation]! - uniquenessMap[a.mutation]!;
      default:
        throw new Error('Unimplemented case');
    }
  });
};

const Proportion = ({ value }: { value: number }) => (
  <span className={sortOptionCssClass['proportion']}>{(value * 100).toFixed(2)}%</span>
);

const Uniqueness = ({ value }: { value: number | undefined }) => {
  return <span className={sortOptionCssClass['uniqueness']}>{value?.toFixed(2) ?? '...'}</span>;
};

const fetchUniquenessScore = (
  proportionEntry: MutationProportionEntry,
  selector: LocationDateVariantSelector,
  variantCount: number,
  type: SequenceType
): Promise<number> => {
  const mutSelector: VariantSelector =
    type === 'aa'
      ? { aaMutations: [proportionEntry.mutation] }
      : { nucMutations: [proportionEntry.mutation] };
  return fetchSamplesCount({
    ...selector,
    variant: mutSelector,
  }).then(mutationCount => calculateJaccardSimilarity(variantCount, mutationCount, proportionEntry.count));
};

/**
 *
 * @param variantCount The number of sequences of the variant
 * @param mutationCount The number of sequences with the mutation
 * @param bothCount The number of sequences that belong to the variant and have the mutation
 */
const calculateJaccardSimilarity = (variantCount: number, mutationCount: number, bothCount: number) => {
  return bothCount / (variantCount + mutationCount - bothCount);
};
