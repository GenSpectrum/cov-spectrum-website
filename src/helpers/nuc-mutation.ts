import { Utils } from '../services/Utils';

export type DecodedNucMuation = {
  originalBase: string | undefined;
  position: number;
  mutatedBase: string | undefined;
};

export function decodeNucMutation(mutation: string): DecodedNucMuation {
  let originalBase = undefined;
  let positionCharStart = 0;
  if (Utils.isLetter(mutation.charAt(0))) {
    originalBase = mutation.charAt(0);
    positionCharStart = 1;
  }
  let mutatedBase = undefined;
  let positionCharEnd = mutation.length;
  if (Utils.isLetter(mutation.charAt(mutation.length - 1))) {
    mutatedBase = mutation.charAt(mutation.length - 1);
    positionCharEnd = mutation.length - 1;
  }
  const position = parseInt(mutation.substring(positionCharStart, positionCharEnd));
  return {
    originalBase,
    position,
    mutatedBase,
  };
}

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
      position: decodeNucMutation(mutationExtractorFunc(x)).position,
    }))
    .sort((a, b) => a.position - b.position)
    .map(m => m.x);
}
