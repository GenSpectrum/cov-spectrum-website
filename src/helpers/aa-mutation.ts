import { decodeNucMutation } from './nuc-mutation';
import jsonRefData from '../data/refData.json';
import { ReferenceGenomeGeneInfo, ReferenceGenomeInfo } from '../data/ReferenceGenomeInfo';

const filterRefData = (geneData: readonly ReferenceGenomeGeneInfo[], geneName: string) => {
  return geneData.filter((gene: ReferenceGenomeGeneInfo) => gene.name === geneName)[0];
};

export type DecodedAAMutation = {
  gene: string;
  originalBase: string | undefined;
  position: number;
  mutatedBase: string | undefined;
};

export function decodeAAMutation(mutation: string): DecodedAAMutation {
  const [gene, tail] = mutation.split(':');
  const decodedTail = decodeNucMutation(tail);
  return {
    gene,
    ...decodedTail,
  };
}

export function decodedAAMutationToString(mutation: DecodedAAMutation) {
  return (
    mutation.gene + ':' + (mutation.originalBase || '') + mutation.position + (mutation.mutatedBase || '')
  );
}

/**
 * A mutation list should be first sorted by the protein, then by the position within the protein.
 */
export function sortAAMutationList(mutations: string[]): string[] {
  return sortListByAAMutation(mutations, x => x);
}

export function sortListByAAMutation<T>(list: T[], mutationExtractorFunc: (x: T) => string) {
  const refData: readonly ReferenceGenomeGeneInfo[] = (jsonRefData as ReferenceGenomeInfo).genes;

  return list
    .map(x => {
      const mutation = mutationExtractorFunc(x);
      const mutationDecoded = decodeAAMutation(mutation);
      return { x, mutationDecoded };
    })
    .sort((a, b) => {
      if (a.mutationDecoded.gene !== b.mutationDecoded.gene) {
        const startPositionA = filterRefData(refData, a.mutationDecoded.gene).startPosition;
        const startPositionB = filterRefData(refData, b.mutationDecoded.gene).startPosition;
        return startPositionA - startPositionB;
      }
      return a.mutationDecoded.position - b.mutationDecoded.position;
    })
    .map(m => m.x);
}

export function isValidAAMutation(mutation: string): boolean {
  // TODO Only allow existing genes
  return /^[A-Z]{1,3}[0-9]{0,2}[AB]?:[A-Z]?[0-9]+[A-Z-*\\.]?$/.test(mutation.toUpperCase());
}

export function isValidNspNotation(mutation: string): boolean {
  // TODO Only allow existing genes
  return /^NSP[0-9]{0,2}:[A-Z]?[0-9]+[A-Z]?$/.test(mutation.toUpperCase());
}

export function isValidABNotation(mutation: string): boolean {
  // TODO Only allow existing genes

  return /^ORF1AB:[A-Z]?[0-9]+[A-Z]?$/.test(mutation.toUpperCase());
}
