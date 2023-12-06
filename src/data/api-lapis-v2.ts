export function mapFilterToLapisV2(filter: string) {
  switch (filter) {
    case 'aaMutations':
      return 'aminoAcidMutations';
    case 'nucMutations':
      return 'nucleotideMutations';
    case 'aaInsertions':
      return 'aminoAcidInsertions';
    case 'nucInsertions':
      return 'nucleotideInsertions';
  }
  return filter;
}
