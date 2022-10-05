export type ReferenceGenomeInfo = {
  nucSeq: string;
  genes: ReferenceGenomeGeneInfo[];
};

export type ReferenceGenomeGeneInfo = {
  name: string;
  startPosition: number;
  endPosition: number;
  aaSeq: number;
};
