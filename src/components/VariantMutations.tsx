import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MutationName } from './MutationName';
import { decodeAAMutation, sortListByAAMutation } from '../helpers/aa-mutation';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionEntry } from '../data/MutationProportionEntry';
import { fetchSamplesCount } from '../data/api-lapis';
import { SequenceType } from '../data/SequenceType';
import { VariantSelector } from '../data/VariantSelector';
import { PromiseQueue } from '../helpers/PromiseQueue';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import NumericInput from 'react-numeric-input';
import { LapisSelector } from '../data/LapisSelector';
import { useResizeDetector } from 'react-resize-detector';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { NamedCard } from './NamedCard';

export interface Props {
  selector: LapisSelector;
}

interface MutationListProps {
  width: number;
}

export const MutationList = styled.ul<MutationListProps>`
  list-style-type: disc;
  margin-top: 10px;
  column-count: ${props => (Math.floor(props.width / 280) >= 1 ? Math.floor(props.width / 300) : 1)};
`;

export const MutationEntry = styled.li`
  width: 260px;
  display: inline-block;
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
  const [checked, setChecked] = useState<boolean>(false);
  const [showMergedList, setShowMergedList] = useState(false);
  const [commonAAMutationsSort, setCommonAAMutationsSort] = useState<SortOptions>('position');
  const [commonNucMutationsSort, setCommonNucMutationsSort] = useState<SortOptions>('position');
  const [aaMutationUniqueness, setAAMutationUniqueness] = useState<MutationUniquenessMap>({});
  const [nucMutationUniqueness, setNucMutationUniqueness] = useState<MutationUniquenessMap>({});
  const [minProportion, setMinProportion] = useState<number>(0.05);
  const [maxProportion, setMaxProportion] = useState<number>(1);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const { width, ref } = useResizeDetector<HTMLDivElement>();

  const queryStatus = useQuery(
    signal =>
      Promise.all([
        fetchSamplesCount(selector, signal),
        MutationProportionData.fromApi(selector, 'aa', signal),
        MutationProportionData.fromApi(selector, 'nuc', signal),
      ]).then(async ([variantCount, aaMutationDataset, nucMutationDataset]) => {
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
        fetchUniquenessScore(nucElement, selector, variantCount, 'nuc').then(uniqueness => {
          setNucMutationUniqueness(prev => ({
            ...prev,
            [nucElement.mutation]: uniqueness,
          }));
        })
      );
    }
  }, [queryStatus.data, selector]);

  if (queryStatus.isLoading || !queryStatus.data) {
    return <Loader />;
  }
  const data = queryStatus.data;

  return (
    <NamedCard title='Subsitutions and deletions'>
      <div className='mb-8'>
        <div className='ml-0' ref={ref}>
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
        <div className='ml-0'>
          The following amino acid mutations are present in between{' '}
          <NumericInput
            precision={1}
            step={0.1}
            min={0.1}
            max={99}
            style={{ input: { width: '85px', textAlign: 'right' } }}
            format={value => `${value}%`}
            value={(minProportion * 100).toFixed(1)}
            onChange={value => setMinProportion(value! / 100)}
          />{' '}
          <NumericInput
            precision={1}
            step={0.1}
            min={0.2}
            max={100}
            style={{ input: { width: '85px', textAlign: 'right' } }}
            format={value => `${value}%`}
            value={(maxProportion * 100).toFixed(1)}
            onChange={value => setMaxProportion(value! / 100)}
          />{' '}
          of the sequences of this variant.
        </div>
      </div>

      <div>
        {' '}
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
            label='Show deletions'
          />
        </FormGroup>
      </div>

      {showMergedList ? (
        <>
          <div className='ml-0'>
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

          <MutationList className='list-disc' width={width ? width : 1}>
            {sortMergedEntries(data.mergedEntries, commonAAMutationsSort, aaMutationUniqueness)
              .filter(({ aa }) => aa.proportion >= minProportion && aa.proportion <= maxProportion)
              .filter(({ aa }) => {
                return !checked ? aa.mutation.slice(-1) !== '-' : true;
              })
              .map(({ aa, nucs }) => (
                <MutationEntry key={aa.mutation}>
                  &#8226;
                  <MutationName mutation={aa.mutation} /> (<Proportion value={aa.proportion} />,{' '}
                  <Uniqueness value={aaMutationUniqueness[aa.mutation]} />)
                  <ul className='list-circle'>
                    {sortNucMutations(nucs, 'position', nucMutationUniqueness)
                      .filter(nuc => nuc.proportion >= minProportion && nuc.proportion <= maxProportion)
                      .map(nuc => (
                        <MutationEntry key={nuc.mutation} style={{ display: 'inline-block' }}>
                          {nuc.mutation} (<Proportion value={nuc.proportion} />,{' '}
                          <Uniqueness value={nucMutationUniqueness[nuc.mutation]} />)
                        </MutationEntry>
                      ))}
                  </ul>
                </MutationEntry>
              ))}
          </MutationList>
          <div className='ml-0 mt-4'>Additional nucleotide mutations:</div>
          <MutationList className='list-circle ml-6' width={width ? width : 1}>
            {sortNucMutations(data.additionalNucs, commonAAMutationsSort, nucMutationUniqueness)
              .filter(({ proportion }) => proportion >= minProportion && proportion <= maxProportion)
              .filter(({ mutation }) => {
                return !checked ? mutation.slice(-1) !== '-' : true;
              })
              .map(({ mutation, proportion }) => {
                return (
                  <MutationEntry key={mutation} style={{ display: 'inline-block' }}>
                    &#8226; {mutation} (<Proportion value={proportion} />,{' '}
                    <Uniqueness value={nucMutationUniqueness[mutation]} />)
                  </MutationEntry>
                );
              })}
          </MutationList>
        </>
      ) : (
        <>
          <div className='ml-0'>
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

          <MutationList className='list-disc' width={width ? width : 1}>
            {sortAAMutations(data.aa, commonAAMutationsSort, aaMutationUniqueness)
              .filter(({ proportion }) => proportion >= minProportion && proportion <= maxProportion)
              .filter(({ mutation }) => {
                return !checked ? mutation.slice(-1) !== '-' : true;
              })
              .map(({ mutation, proportion }) => {
                return (
                  <MutationEntry key={mutation} style={{ display: 'inline-block' }}>
                    &#8226;
                    <MutationName mutation={mutation} /> (<Proportion value={proportion} />,{' '}
                    <Uniqueness value={aaMutationUniqueness[mutation]} />)
                  </MutationEntry>
                );
              })}
          </MutationList>

          <div className='ml-0 mt-9'>
            <div className='mt-9'>Leading and trailing deletions are excluded.</div>

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
          <div className='ml-0'>
            *Leading and trailing deletions are excluded. <br />
          </div>
          <MutationList className='list-disc' width={width ? width : 1}>
            {sortNucMutations(data.nuc, commonNucMutationsSort, nucMutationUniqueness)
              .filter(({ proportion }) => proportion >= minProportion && proportion <= maxProportion)
              .filter(({ mutation }) => {
                return !checked ? mutation.slice(-1) !== '-' : true;
              })
              .map(({ mutation, proportion }) => {
                return (
                  <MutationEntry key={mutation} style={{ display: 'inline-block' }}>
                    &#8226; {mutation} (<Proportion value={proportion} />,{' '}
                    <Uniqueness value={nucMutationUniqueness[mutation]} />)
                  </MutationEntry>
                );
              })}
          </MutationList>
        </>
      )}
    </NamedCard>
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
  selector: LapisSelector,
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
