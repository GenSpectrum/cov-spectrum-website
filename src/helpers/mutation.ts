export type DecodedMutation = {
  gene: string;
  originalBase: string | undefined;
  position: number;
  mutatedBase: string | undefined;
};

function isLetter(x: string): boolean {
  return /[a-zA-Z*-]/.test(x);
}

const geneNameMap = new Map(
  ['E', 'M', 'N', 'ORF1a', 'ORF1b', 'ORF3a', 'ORF6', 'ORF7a', 'ORF7b', 'ORF8', 'ORF9b', 'S'].map(x => [
    x.toLowerCase(),
    x,
  ])
);

export function decodeMutation(mutation: string): DecodedMutation {
  const [gene, tail] = mutation.split(':');
  let originalBase = undefined;
  let positionCharStart = 0;
  if (isLetter(tail.charAt(0))) {
    originalBase = tail.charAt(0);
    positionCharStart = 1;
  }
  let mutatedBase = undefined;
  let positionCharEnd = tail.length;
  if (isLetter(tail.charAt(tail.length - 1))) {
    mutatedBase = tail.charAt(tail.length - 1);
    positionCharEnd = tail.length - 1;
  }
  const position = parseInt(tail.substring(positionCharStart, positionCharEnd));
  return {
    gene,
    originalBase,
    position,
    mutatedBase,
  };
}

export function normalizeDecodedMutation({
  gene,
  originalBase,
  position,
  mutatedBase,
}: DecodedMutation): DecodedMutation {
  // TODO We could improve that by storing the reference genome so that we can always fill out the original base.
  return {
    gene: geneNameMap.get(gene.toLowerCase())!,
    originalBase: originalBase?.toUpperCase(),
    position,
    mutatedBase: mutatedBase?.toUpperCase(),
  };
}

export function decodedMutationToString(mutation: DecodedMutation) {
  return (
    mutation.gene + ':' + (mutation.originalBase || '') + mutation.position + (mutation.mutatedBase || '')
  );
}

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
      const mutationDecoded = decodeMutation(mutation);
      return { x, mutationDecoded };
    })
    .sort((a, b) => {
      if (a.mutationDecoded.gene !== b.mutationDecoded.gene) {
        return a.mutationDecoded.gene.localeCompare(b.mutationDecoded.gene);
      }
      return a.mutationDecoded.position - b.mutationDecoded.position;
    })
    .map(m => m.x);
}

export function isValidMutation(mutation: string): boolean {
  // TODO Only allow existing genes
  return /^[A-Z]{1,3}[0-9]{0,2}[AB]?:[A-Z]?[0-9]+[A-Z-*]?$/.test(mutation.toUpperCase());
}
