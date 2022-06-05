export function isValidNucMutation(mutation: string): boolean {
  // TODO Only allow existing genes
  return /^[ATCG]?[0-9]+[ATCG\-\\.]?$/.test(mutation.toUpperCase());
}

export function sortNucMutationList(mutations: string[]): string[] {
  return sortListByNucMutation(mutations, x => x);
}

export function sortListByNucMutation<T>(list: T[], mutationExtractorFunc: (x: T) => string) {
  return list
    .map(x => ({
      x,
      mutation: mutationExtractorFunc(x),
    }))
    .sort((a, b) => {
      return (
        parseInt(a.mutation.substr(1, a.mutation.length - 2)) -
        parseInt(b.mutation.substr(1, b.mutation.length - 2))
      );
    })
    .map(m => m.x);
}
