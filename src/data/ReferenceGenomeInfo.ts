export type ReferenceGenomeInfo = {
  nuqSeq: string;
  genes: ReferenceGenomeGeneInfo[];
};

export type ReferenceGenomeGeneInfo = {
  name: string;
  startPosition: number;
  endPosition: number;
  aaSeq: number;
};
