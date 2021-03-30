/**
 * A mutation list should be first sorted by the protein, then by the position within the protein.
 */
export function sortMutationList(mutations: string[]): string[] {
  return mutations
    .map(mutation => {
      const split = mutation.split(':');
      const protein = split[0];
      const position = parseInt(split[1].substring(1, split[1].length - 1));
      return { mutation, protein, position };
    })
    .sort((a, b) => {
      if (a.protein !== b.protein) {
        return a.protein.localeCompare(b.protein);
      }
      return a.position - b.position;
    })
    .map(m => m.mutation);
}
