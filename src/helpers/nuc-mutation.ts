export function isValidNucMutation(mutation: string): boolean {
  // TODO Only allow existing genes
  return /^[ATCG]?[0-9]+[ATCG-\\.]?$/.test(mutation.toUpperCase());
}
