export type QcSelector = {
  nextcladeQcOverallScoreFrom?: number;
  nextcladeQcOverallScoreTo?: number;
  nextcladeQcMissingDataScoreFrom?: number;
  nextcladeQcMissingDataScoreTo?: number;
  nextcladeQcMixedSitesScoreFrom?: number;
  nextcladeQcMixedSitesScoreTo?: number;
  nextcladeQcPrivateMutationsScoreFrom?: number;
  nextcladeQcPrivateMutationsScoreTo?: number;
  nextcladeQcSnpClustersScoreFrom?: number;
  nextcladeQcSnpClustersScoreTo?: number;
  nextcladeQcFrameShiftsScoreFrom?: number;
  nextcladeQcFrameShiftsScoreTo?: number;
  nextcladeQcStopCodonsScoreFrom?: number;
  nextcladeQcStopCodonsScoreTo?: number;
};

const fields = [
  'nextcladeQcOverallScoreFrom',
  'nextcladeQcOverallScoreTo',
  'nextcladeQcMissingDataScoreFrom',
  'nextcladeQcMissingDataScoreTo',
  'nextcladeQcMixedSitesScoreFrom',
  'nextcladeQcMixedSitesScoreTo',
  'nextcladeQcPrivateMutationsScoreFrom',
  'nextcladeQcPrivateMutationsScoreTo',
  'nextcladeQcSnpClustersScoreFrom',
  'nextcladeQcSnpClustersScoreTo',
  'nextcladeQcFrameShiftsScoreFrom',
  'nextcladeQcFrameShiftsScoreTo',
  'nextcladeQcStopCodonsScoreFrom',
  'nextcladeQcStopCodonsScoreTo',
] as const;

export function addQcSelectorToUrlSearchParams(selector: QcSelector, params: URLSearchParams) {
  for (const field of fields) {
    params.delete(field);
    if (selector[field] !== undefined && selector[field] !== null) {
      params.set(field, selector[field]!.toFixed(0));
    }
  }
}

export function readQcSelectorFromUrlSearchParams(params: URLSearchParams): QcSelector {
  const qc: QcSelector = {};
  for (const field of fields) {
    if (params.has(field)) {
      qc[field] = Number.parseInt(params.get(field)!);
    }
  }
  return qc;
}
