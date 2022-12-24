import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { MutationName } from './MutationName';
import { decodeAAMutation, sortListByAAMutation } from '../helpers/aa-mutation';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionEntry } from '../data/MutationProportionEntry';
import { fetchSamplesCount } from '../data/api-lapis';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import NumericInput from 'react-numeric-input';
import { LapisSelector } from '../data/LapisSelector';
import { useResizeDetector } from 'react-resize-detector';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { PipeDividedOptionsButtons } from '../helpers/ui';
import { DeregistrationHandle, ExportManagerContext } from './CombinedExport/ExportManager';
import download from 'downloadjs';
import { csvStringify } from '../helpers/csvStringifyHelper';
import { getConsensusSequenceFromMutations } from '../helpers/variant-consensus-sequence';
import { decodeNucMutation } from '../helpers/nuc-mutation';
import JSZip from 'jszip';

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

type MergedAAAndNucEntry = {
  aa: MutationProportionEntryWithUniqueness;
  nucs: MutationProportionEntryWithUniqueness[];
};

type MutationProportionEntryWithUniqueness = MutationProportionEntry & {
  uniqueness: number;
};

export const VariantMutations = ({ selector }: Props) => {
  const [checked, setChecked] = useState<boolean>(false);
  const [showMergedList, setShowMergedList] = useState(false);
  const [commonAAMutationsSort, setCommonAAMutationsSort] = useState<SortOptions>('position');
  const [commonNucMutationsSort, setCommonNucMutationsSort] = useState<SortOptions>('position');
  const [minProportion, setMinProportion] = useState<number>(0.05);
  const [maxProportion, setMaxProportion] = useState<number>(1);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const { width, ref } = useResizeDetector<HTMLDivElement>();

  // Fetches all mutations and their counts for the country, date range, etc., but independent of the variant.
  // The values will be used to calculate the Jaccard index
  const overallMutationCounts = useQuery(
    signal => {
      const overallSelector: LapisSelector = {
        location: selector.location,
        dateRange: selector.dateRange,
        host: selector.host,
        samplingStrategy: selector.samplingStrategy,
        qc: selector.qc,
        submissionDate: selector.submissionDate,
      };
      return Promise.all([
        MutationProportionData.fromApi(overallSelector, 'aa', signal, 0),
        MutationProportionData.fromApi(overallSelector, 'nuc', signal, 0),
      ]).then(results => {
        const [aa, nuc] = results.map(d => {
          const countMap = new Map();
          for (const entry of d.payload) {
            countMap.set(entry.mutation, entry.count);
          }
          return countMap;
        });
        return { aa, nuc };
      });
    },
    [
      selector.location,
      selector.dateRange,
      selector.host,
      selector.samplingStrategy,
      selector.qc,
      selector.submissionDate,
    ]
  );

  const queryStatus = useQuery(
    signal => {
      if (!overallMutationCounts.data) {
        return Promise.resolve(undefined);
      }

      return Promise.all([
        fetchSamplesCount(selector, signal),
        MutationProportionData.fromApi(selector, 'aa', signal),
        MutationProportionData.fromApi(selector, 'nuc', signal),
      ]).then(async ([variantCount, aaMutationDataset, nucMutationDataset]) => {
        const aa: MutationProportionEntryWithUniqueness[] = aaMutationDataset.payload.map(m => ({
          ...m,
          uniqueness: calculateJaccardSimilarity(
            variantCount,
            overallMutationCounts.data!.aa.get(m.mutation),
            m.count
          ),
        }));
        const nuc: MutationProportionEntryWithUniqueness[] = nucMutationDataset.payload.map(m => ({
          ...m,
          uniqueness: calculateJaccardSimilarity(
            variantCount,
            overallMutationCounts.data!.nuc.get(m.mutation),
            m.count
          ),
        }));
        const aaMap = new Map<string, MergedAAAndNucEntry[]>();
        const additionalNucs: MutationProportionEntryWithUniqueness[] = [];
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
      });
    },
    [selector, overallMutationCounts]
  );

  // Data export
  const exportManager = useContext(ExportManagerContext);
  useEffect(() => {
    if (queryStatus.data) {
      // Small helper
      const transform = (entries: MutationProportionEntryWithUniqueness[]) => {
        return csvStringify(
          entries.map(e => ({
            mutation: e.mutation,
            proportion: e.proportion,
            count: e.count,
            jaccard: e.uniqueness,
          }))
        );
      };

      // Register export handles
      const data = queryStatus.data;
      const handles: DeregistrationHandle[] = [
        exportManager.register('Download nucleotide mutations', async () => {
          download(transform(data.nuc), 'nucleotide-mutations.csv', 'text/csv');
        }),
        exportManager.register('Download AA mutations', async () => {
          download(transform(data.aa), 'aa-mutations.csv', 'text/csv');
        }),
        exportManager.register('Download nucleotide consensus sequence (ignoring deletions)', async () => {
          const reference = (await ReferenceGenomeService.data).nucSeq;
          const mutations = data.nuc.map(e => {
            const decoded = decodeNucMutation(e.mutation);
            return {
              position: decoded.position,
              mutatedBase: decoded.mutatedBase!,
              proportion: e.proportion,
            };
          });
          download(
            '>variant nucleotide consensus\n' +
              getConsensusSequenceFromMutations(reference, mutations) +
              '\n',
            'nucleotide-consensus.fasta',
            'text/x-fasta'
          );
        }),
        exportManager.register('Download AA consensus sequences (ignoring deletions)', async () => {
          const referencesByGene = new Map<string, string>();
          const mutationsByGene = new Map<
            string,
            { position: number; mutatedBase: string; proportion: number }[]
          >();
          for (const { name, aaSeq } of (await ReferenceGenomeService.data).genes) {
            referencesByGene.set(name, aaSeq);
            mutationsByGene.set(name, []);
          }
          for (const { mutation, proportion } of data.aa) {
            const { gene, position, mutatedBase } = decodeAAMutation(mutation);
            mutationsByGene.get(gene)!.push({ position, mutatedBase: mutatedBase!, proportion });
          }
          const zipFile = new JSZip();
          for (const [gene, mutations] of mutationsByGene) {
            const consensus = getConsensusSequenceFromMutations(referencesByGene.get(gene)!, mutations);
            const fastaText = `> variant ${gene}-gene consensus\n${consensus}\n`;
            zipFile.file(`${gene}-consensus.fasta`, fastaText);
          }
          const zipBlob = await zipFile.generateAsync({ type: 'blob' });
          download(zipBlob, 'aa-consensus.zip', 'application/zip');
        }),
      ];

      return () => {
        handles.forEach(handle => handle.deregister());
      };
    }
  }, [exportManager, queryStatus]);

  // View
  if (queryStatus.isLoading || !queryStatus.data) {
    return <Loader />;
  }
  const data = queryStatus.data;

  return (
    <>
      <div className='mb-8'>
        <div className='ml-0' ref={ref}>
          <PipeDividedOptionsButtons
            options={[
              { label: 'Show amino acid and nucleotide mutations separated', value: false },
              { label: 'Show amino acid and nucleotide mutations together', value: true },
            ]}
            selected={showMergedList}
            onSelect={setShowMergedList}
          />
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
          <PipeDividedOptionsButtons
            options={sortOptions.map(opt => ({
              label: (
                <>
                  Sort by <span className={sortOptionCssClass[opt]}>{sortOptionLabels[opt]}</span>
                </>
              ),
              value: opt,
            }))}
            selected={commonAAMutationsSort}
            onSelect={setCommonAAMutationsSort}
          />

          <MutationList className='list-disc' width={width ? width : 1}>
            {sortMergedEntries(data.mergedEntries, commonAAMutationsSort)
              .filter(({ aa }) => aa.proportion >= minProportion && aa.proportion <= maxProportion)
              .filter(({ aa }) => {
                return !checked ? aa.mutation.slice(-1) !== '-' : true;
              })
              .map(({ aa, nucs }) => (
                <MutationEntry key={aa.mutation}>
                  &#8226;
                  <MutationName mutation={aa.mutation} /> (<Proportion value={aa.proportion} />,{' '}
                  <Uniqueness value={aa.uniqueness} />)
                  <ul className='list-circle'>
                    {sortNucMutations(nucs, 'position')
                      .filter(nuc => nuc.proportion >= minProportion && nuc.proportion <= maxProportion)
                      .map(nuc => (
                        <MutationEntry key={nuc.mutation} style={{ display: 'inline-block' }}>
                          {nuc.mutation} (<Proportion value={nuc.proportion} />,{' '}
                          <Uniqueness value={nuc.uniqueness} />)
                        </MutationEntry>
                      ))}
                  </ul>
                </MutationEntry>
              ))}
          </MutationList>
          <div className='ml-0 mt-4'>Additional nucleotide mutations:</div>
          <MutationList className='list-circle ml-6' width={width ? width : 1}>
            {sortNucMutations(data.additionalNucs, commonAAMutationsSort)
              .filter(({ proportion }) => proportion >= minProportion && proportion <= maxProportion)
              .filter(({ mutation }) => {
                return !checked ? mutation.slice(-1) !== '-' : true;
              })
              .map(({ mutation, proportion, uniqueness }) => {
                return (
                  <MutationEntry key={mutation} style={{ display: 'inline-block' }}>
                    &#8226; {mutation} (<Proportion value={proportion} />, <Uniqueness value={uniqueness} />)
                  </MutationEntry>
                );
              })}
          </MutationList>
        </>
      ) : (
        <>
          <PipeDividedOptionsButtons
            options={sortOptions.map(opt => ({
              label: (
                <>
                  Sort by <span className={sortOptionCssClass[opt]}>{sortOptionLabels[opt]}</span>
                </>
              ),
              value: opt,
            }))}
            selected={commonAAMutationsSort}
            onSelect={setCommonAAMutationsSort}
          />

          <MutationList className='list-disc' width={width ? width : 1}>
            {sortAAMutations(data.aa, commonAAMutationsSort)
              .filter(({ proportion }) => proportion >= minProportion && proportion <= maxProportion)
              .filter(({ mutation }) => {
                return !checked ? mutation.slice(-1) !== '-' : true;
              })
              .map(({ mutation, proportion, uniqueness }) => {
                return (
                  <MutationEntry key={mutation} style={{ display: 'inline-block' }}>
                    &#8226;
                    <MutationName mutation={mutation} /> (<Proportion value={proportion} />,{' '}
                    <Uniqueness value={uniqueness} />)
                  </MutationEntry>
                );
              })}
          </MutationList>

          <div className='mt-9'>Leading and trailing deletions are excluded.</div>
          <PipeDividedOptionsButtons
            options={sortOptions.map(opt => ({
              label: (
                <>
                  Sort by <span className={sortOptionCssClass[opt]}>{sortOptionLabels[opt]}</span>
                </>
              ),
              value: opt,
            }))}
            selected={commonNucMutationsSort}
            onSelect={setCommonNucMutationsSort}
          />
          <MutationList className='list-disc' width={width ? width : 1}>
            {sortNucMutations(data.nuc, commonNucMutationsSort)
              .filter(({ proportion }) => proportion >= minProportion && proportion <= maxProportion)
              .filter(({ mutation }) => {
                return !checked ? mutation.slice(-1) !== '-' : true;
              })
              .map(({ mutation, proportion, uniqueness }) => {
                return (
                  <MutationEntry key={mutation} style={{ display: 'inline-block' }}>
                    &#8226; {mutation} (<Proportion value={proportion} />, <Uniqueness value={uniqueness} />)
                  </MutationEntry>
                );
              })}
          </MutationList>
        </>
      )}
    </>
  );
};

const sortAAMutations = (
  entries: MutationProportionEntryWithUniqueness[],
  sortOption: SortOptions
): MutationProportionEntryWithUniqueness[] => {
  switch (sortOption) {
    case 'proportion':
      return [...entries].sort((a, b) => b.proportion - a.proportion);
    case 'position':
      return sortListByAAMutation(entries, x => x.mutation);
    case 'uniqueness':
      return [...entries].sort((a, b) => b.uniqueness - a.uniqueness);
  }
};

const sortNucMutations = (
  entries: MutationProportionEntryWithUniqueness[],
  sortOption: SortOptions
): MutationProportionEntryWithUniqueness[] => {
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
        return b.uniqueness - a.uniqueness;
      default:
        throw new Error('Unimplemented case');
    }
  });
};

const sortMergedEntries = (
  entries: MergedAAAndNucEntry[],
  sortOption: SortOptions
): MergedAAAndNucEntry[] => {
  // TODO This is very redundant to sortAAMutations().
  switch (sortOption) {
    case 'proportion':
      return [...entries].sort((a, b) => b.aa.proportion - a.aa.proportion);
    case 'position':
      return sortListByAAMutation(entries, x => x.aa.mutation);
    case 'uniqueness':
      return [...entries].sort((a, b) => b.aa.uniqueness - a.aa.uniqueness);
  }
};

const Proportion = ({ value }: { value: number }) => (
  <span className={sortOptionCssClass['proportion']}>{(value * 100).toFixed(2)}%</span>
);

const Uniqueness = ({ value }: { value: number | undefined }) => {
  return <span className={sortOptionCssClass['uniqueness']}>{value?.toFixed(2) ?? '...'}</span>;
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
