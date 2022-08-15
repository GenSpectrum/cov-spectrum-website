import { LapisSelector } from '../data/LapisSelector';
import { useQuery } from '../helpers/query-hook';
import { InsertionCountData } from '../data/InsertionCountDataset';
import Loader from './Loader';
import { useMemo } from 'react';
import { NamedCard } from './NamedCard';
import { MutationEntry, MutationList } from './VariantMutations';
import { useResizeDetector } from 'react-resize-detector';

type VariantInsertionsProps = {
  selector: LapisSelector;
};

export const VariantInsertions = ({ selector }: VariantInsertionsProps) => {
  const { width, ref } = useResizeDetector<HTMLDivElement>();

  const { data: aaInsertions } = useQuery(
    signal => InsertionCountData.fromApi(selector, 'aa', signal),
    [selector]
  );
  const { data: nucInsertions } = useQuery(
    signal => InsertionCountData.fromApi(selector, 'nuc', signal),
    [selector]
  );

  const aaInsertionsSorted = useMemo(() => {
    if (!aaInsertions) {
      return undefined;
    }
    return [...aaInsertions.payload].sort((a, b) => b.count - a.count);
  }, [aaInsertions]);
  const nucInsertionsSorted = useMemo(() => {
    if (!nucInsertions) {
      return undefined;
    }
    return [...nucInsertions.payload].sort((a, b) => b.count - a.count);
  }, [nucInsertions]);

  if (!aaInsertionsSorted || !nucInsertionsSorted) {
    return <Loader />;
  }

  return (
    <NamedCard title='Insertions'>
      <div ref={ref}></div>
      <h2>Amino acids</h2>
      <MutationList className='list-disc' width={width ? width : 1}>
        {aaInsertionsSorted.map(({ insertion, count }) => (
          <MutationEntry key={insertion} style={{ display: 'inline-block' }} className='break-words'>
            &#8226;&nbsp;{insertion} ({count} seqs)
          </MutationEntry>
        ))}
      </MutationList>
      <h2>Nucleotides</h2>
      <MutationList className='list-disc' width={width ? width : 1}>
        {nucInsertionsSorted.map(({ insertion, count }) => (
          <MutationEntry key={insertion} style={{ display: 'inline-block' }} className='break-words'>
            &#8226;&nbsp;{insertion} ({count} seqs)
          </MutationEntry>
        ))}
      </MutationList>
    </NamedCard>
  );
};
