import { LapisSelector } from '../data/LapisSelector';
import { useQuery } from '../helpers/query-hook';
import { InsertionCountData } from '../data/InsertionCountDataset';
import Loader from './Loader';
import { useMemo, useState } from 'react';
import { NamedCard } from './NamedCard';
import { MutationEntry, MutationList } from './VariantMutations';
import { useResizeDetector } from 'react-resize-detector';

type VariantInsertionsProps = {
  selector: LapisSelector;
};

export const VariantInsertions = ({ selector }: VariantInsertionsProps) => {
  const { width, ref } = useResizeDetector<HTMLDivElement>();
  const [showAllAA, setShowAllAA] = useState(false);
  const [showAllNuc, setShowAllNuc] = useState(false);
  const truncatedSize = 16; // The maximal number of insertions that should be shown if showAll is false

  const { data: aaInsertions } = useQuery(
    signal => InsertionCountData.fromApi(selector, 'aa', signal),
    [selector]
  );
  const { data: nucInsertions } = useQuery(
    signal => InsertionCountData.fromApi(selector, 'nuc', signal),
    [selector]
  );

  const [aaInsertionsForDisplay, nucInsertionsForDisplay] =
    useMemo(() => {
      if (!aaInsertions || !nucInsertions) {
        return undefined;
      }
      return [aaInsertions, nucInsertions].map((insertions, i) => ({
        totalInsertions: insertions.payload.length,
        data: [...insertions.payload]
          .sort((a, b) => b.count - a.count)
          .slice(0, [showAllAA, showAllNuc][i] ? Infinity : truncatedSize),
      }));
    }, [aaInsertions, nucInsertions, showAllAA, showAllNuc]) ?? [];

  if (!aaInsertionsForDisplay || !nucInsertionsForDisplay) {
    return <Loader />;
  }

  return (
    <NamedCard title='Insertions'>
      <div ref={ref}></div>
      <h2>Amino acids</h2>
      <MutationList className='list-disc' width={width ? width : 1}>
        {aaInsertionsForDisplay.data.map(({ insertion, count }) => (
          <MutationEntry key={insertion} style={{ display: 'inline-block' }} className='break-words'>
            &#8226;&nbsp;{insertion} ({count} seqs)
          </MutationEntry>
        ))}
      </MutationList>
      {aaInsertionsForDisplay.totalInsertions > truncatedSize ? (
        <button className='underline my-2' onClick={() => setShowAllAA(!showAllAA)}>
          {showAllAA ? 'Show less' : 'Show all'}
        </button>
      ) : (
        <></>
      )}
      <h2>Nucleotides</h2>
      <MutationList className='list-disc' width={width ? width : 1}>
        {nucInsertionsForDisplay.data.map(({ insertion, count }) => (
          <MutationEntry key={insertion} style={{ display: 'inline-block' }} className='break-words'>
            &#8226;&nbsp;{insertion} ({count} seqs)
          </MutationEntry>
        ))}
      </MutationList>
      {nucInsertionsForDisplay.totalInsertions > truncatedSize ? (
        <button className='underline my-2' onClick={() => setShowAllNuc(!showAllNuc)}>
          {showAllNuc ? 'Show less' : 'Show all'}
        </button>
      ) : (
        <></>
      )}
    </NamedCard>
  );
};
