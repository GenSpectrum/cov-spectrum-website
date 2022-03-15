import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MutationName } from './MutationName';
import { decodeAAMutation, sortListByAAMutation } from '../helpers/aa-mutation';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionEntry } from '../data/MutationProportionEntry';
import { fetchSamplesCount } from '../data/api-lapis';
import { SequenceType } from '../data/SequenceType';
import { VariantSelector } from '../data/VariantSelector';
import { PromiseQueue } from '../helpers/PromiseQueue';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

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

type MergedAAAndNucEntry = {
  aa: MutationProportionEntry;
  nucs: MutationProportionEntry[];
};

export const VariantMutations = ({ selector }: Props) => {
  const [showMergedList, setShowMergedList] = useState(false);
  const [commonAAMutationsSort, setCommonAAMutationsSort] = useState<SortOptions>('position');
  const [commonNucMutationsSort, setCommonNucMutationsSort] = useState<SortOptions>('position');
  const [aaMutationUniqueness, setAAMutationUniqueness] = useState<MutationUniquenessMap>({});
  const [nucMutationUniqueness, setNucMutationUniqueness] = useState<MutationUniquenessMap>({});

  const queryStatus = useQuery(
    signal =>
      Promise.all([
        fetchSamplesCount(selector, signal),
        MutationProportionData.fromApi(selector, 'aa', signal),
        MutationProportionData.fromApi(selector, 'nuc', signal),
      ]).then(async ([variantCount, aaMutationDataset, nucMutationDataset]) => {

        //console.log(aaMutationDataset)
        console.log(nucMutationDataset)

        const aa = aaMutationDataset.payload;
        const nuc = nucMutationDataset.payload;
        const aaMap = new Map<string, MergedAAAndNucEntry[]>();
        const additionalNucs: MutationProportionEntry[] = [];
        for (let aaElement of aa) {
          const aaDecoded = decodeAAMutation(aaElement.mutation);
          const aaString = aaDecoded.gene + ':' + aaDecoded.position;
          // There could be multiple common mutations at the same position. We will show all nucleotide mutations at
          // positions that encode an AA.
          if (!aaMap.has(aaString)) {
            aaMap.set(aaString, []);
          }
          aaMap.get(aaString)!.push({ aa: aaElement, nucs: [] });
        }
        for (let nucElement of nuc) {
          const nucPosition = Number.parseInt(nucElement.mutation.substr(1, nucElement.mutation.length - 2));
          let aaString = await ReferenceGenomeService.getAAOfNuc(nucPosition);
          if (!aaString || !aaMap.has(aaString)) {
            additionalNucs.push(nucElement);
          } else {
            for (let mergedEntry of aaMap.get(aaString)!) {
              mergedEntry.nucs.push(nucElement);
            }
          }
        }
        const mergedEntries = [...aaMap.values()].flat();
        return {
          variantCount,
          aa,
          nuc,
          mergedEntries,
          additionalNucs,
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

  //console.log(data.aa)
  //console.log( data.aa.filter((aa: any) => aa.proportion < 0.05 ) )
  

  return (
    <>
      <div className='ml-4 mb-4'>
        <span
          className={!showMergedList ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setShowMergedList(false)}
        >
          Show amino acid and nucleotide mutations separated
        </span>
        {' | '}
        <span
          className={showMergedList ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setShowMergedList(true)}
        >
          Show amino acid and nucleotide mutations together
        </span>
      </div>
      <div style={{marginBottom: '1rem'}}>
        Display the mutations that are present in &nbsp;
        <div className="inline-block">
          <InputGroup inline-block style={{width: '8rem'}}>
            <FormControl value="5"/>
            <InputGroup.Text>%</InputGroup.Text>
          </InputGroup>
        </div>
        &nbsp; to &nbsp;
        <div className="inline-block">
          <InputGroup inline-block style={{width: '8rem'}}>
            <FormControl value="100"/>
            <InputGroup.Text>%</InputGroup.Text>
          </InputGroup>
        </div>
        &nbsp; of the sequences of this variant.
      </div>
      {showMergedList ? (
        <>
          {/*<div>The following mutations are present in at least 5% of the sequences of this variant:</div>*/}
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
            {sortMergedEntries(data.mergedEntries, commonAAMutationsSort, aaMutationUniqueness).map(
              ({ aa, nucs }) => (
                <MutationEntry key={aa.mutation}>
                  <MutationName mutation={aa.mutation} /> (<Proportion value={aa.proportion} />,{' '}
                  <Uniqueness value={aaMutationUniqueness[aa.mutation]} />)
                  <ul className='list-circle'>
                    {sortNucMutations(nucs, 'position', nucMutationUniqueness).map(nuc => (
                      <MutationEntry key={nuc.mutation}>
                        {nuc.mutation} (<Proportion value={nuc.proportion} />,{' '}
                        <Uniqueness value={nucMutationUniqueness[nuc.mutation]} />)
                      </MutationEntry>
                    ))}
                  </ul>
                </MutationEntry>
              )
            )}
          </MutationList>
          <div className='ml-4 mt-4'>Additional nucleotide mutations:</div>
          <MutationList className='list-circle ml-6'>
            {sortNucMutations(data.additionalNucs, commonAAMutationsSort, nucMutationUniqueness).map(
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
      ) : (
        <>
          <div>
            {/*The following amino acid mutations are present in at least 5% of the sequences of this variant.*/}
            Please note that we currently <b>do not</b> exclude the unknowns when calculating the proportions.
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
            {/*The following nucleotide mutations are present in at least 5% of the sequences of this variant*/}
            Leading and tailing deletions are excluded. Please note that we currently <b>do not</b> exclude
            the unknowns when calculating the proportions.
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
      )}
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

const sortMergedEntries = (
  entries: MergedAAAndNucEntry[],
  sortOption: SortOptions,
  uniquenessMap: MutationUniquenessMap
): MergedAAAndNucEntry[] => {
  // TODO This is very redundant to sortAAMutations().
  switch (sortOption) {
    case 'proportion':
      return [...entries].sort((a, b) => b.aa.proportion - a.aa.proportion);
    case 'position':
      return sortListByAAMutation(entries, x => x.aa.mutation);
    case 'uniqueness':
      return [...entries].sort((a, b) => {
        if (uniquenessMap[a.aa.mutation] === undefined && uniquenessMap[b.aa.mutation] === undefined) {
          return 0;
        }
        if (uniquenessMap[a.aa.mutation] === undefined) {
          return 1;
        }
        if (uniquenessMap[b.aa.mutation] === undefined) {
          return -1;
        }
        return uniquenessMap[b.aa.mutation]! - uniquenessMap[a.aa.mutation]!;
      });
  }
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
