type Mutation = { position: number; mutatedBase: string; proportion: number };

/**
 * Given a set of mutations and their proportions (within a variant), this function generates the consensus sequence
 * of the variant. For each position, the consensus sequence uses the base/code that occurs most often.
 *
 * Deletions are excluded.
 */
export function getConsensusSequenceFromMutations(reference: string, mutations: Mutation[]): string {
  const mutationsByPosition = new Map<number, Mutation[]>();
  for (const mutation of mutations) {
    const position = mutation.position;
    if (!mutationsByPosition.has(position)) {
      mutationsByPosition.set(position, []);
    }
    mutationsByPosition.get(position)!.push(mutation);
  }
  const consensusSequenceChars = Array.from(reference);
  for (const [position, mutations] of mutationsByPosition) {
    let totalMutationProportion = 0;
    let maxProportion = -1;
    let mutationWithMaxProportion = '';
    for (const { proportion, mutatedBase } of mutations) {
      if (mutatedBase === '-') {
        continue;
      }
      totalMutationProportion += proportion;
      if (proportion > maxProportion) {
        maxProportion = proportion;
        mutationWithMaxProportion = mutatedBase;
      }
    }
    // If the most common mutation occurs more often than the reference base, it replaces the reference.
    const referenceBaseProportion = 1 - totalMutationProportion;
    if (maxProportion > referenceBaseProportion) {
      consensusSequenceChars[position - 1] = mutationWithMaxProportion;
    }
  }
  return consensusSequenceChars.join('');
}
