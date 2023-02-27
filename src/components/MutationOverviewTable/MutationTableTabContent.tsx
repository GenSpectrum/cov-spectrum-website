import {
  BaselineMutationsTable,
  BaselineMutationsTableProps,
  SingleMutationsTable,
  SingleMutationsTableProps,
} from './MutationsTable';

type MutationTableTabContentProps = SingleMutationsTableProps &
  BaselineMutationsTableProps & {
    mode: 'Single' | 'CompareToBaseline';
  };

export default function MutationTableTabContent({
  mutationType,
  variants,
  locationSelector,
  dateRangeSelector,
  mode,
  baselineVariant,
}: MutationTableTabContentProps) {
  switch (mode) {
    case 'Single':
      return (
        <div className='mt-4'>
          <SingleMutationsTable
            variants={variants}
            locationSelector={locationSelector}
            mutationType={mutationType}
            dateRangeSelector={dateRangeSelector}
          />
        </div>
      );
    case 'CompareToBaseline':
      return (
        <BaselineMutationsTable
          variants={variants}
          mutationType={mutationType}
          locationSelector={locationSelector}
          baselineVariant={baselineVariant}
          dateRangeSelector={dateRangeSelector}
        />
      );
  }
}
