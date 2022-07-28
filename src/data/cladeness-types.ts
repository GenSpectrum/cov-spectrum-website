export type CladenessMrcaResponse = {
  notFound: string[];
  result: string;
};

export type CladenessClustersResponse = {
  notFound: string[];
  result: CladenessCluster;
};

export type CladenessCluster = {
  node: string;
  statistics: {
    cladeness: number;
    size: number;
  };
  children?: CladenessCluster[];
};
