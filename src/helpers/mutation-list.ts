/**
 * A mutation list should be first sorted by the protein, then by the position within the protein.
 */
export function sortMutationList(mutations: string[]): string[] {
  return sortListByMutation(mutations, x => x);
}

export function sortListByMutation<T>(list: T[], mutationExtractorFunc: (x: T) => string) {
  return list
    .map(x => {
      const mutation = mutationExtractorFunc(x);
      const split = mutation.split(':');
      const protein = split[0];
      const position = parseInt(split[1].substring(1, split[1].length - 1));
      const mutationDecoded = { mutation, protein, position };

      return { x, mutationDecoded };
    })
    .sort((a, b) => {
      if (a.mutationDecoded.protein !== b.mutationDecoded.protein) {
        return a.mutationDecoded.protein.localeCompare(b.mutationDecoded.protein);
      }
      return a.mutationDecoded.position - b.mutationDecoded.position;
    })
    .map(m => m.x);
}
