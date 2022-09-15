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
  nextcladeCoverageFrom?: number;
  nextcladeCoverageTo?: number;
};

export type QcFieldType = 'integer' | 'float';

export const qcFieldsAndLabels = [
  {
    label: 'Overall score',
    fromField: 'nextcladeQcOverallScoreFrom' as const,
    toField: 'nextcladeQcOverallScoreTo' as const,
    type: 'integer' as QcFieldType,
  },
  {
    label: 'Missing data score',
    fromField: 'nextcladeQcMissingDataScoreFrom' as const,
    toField: 'nextcladeQcMissingDataScoreTo' as const,
    type: 'integer' as QcFieldType,
  },
  {
    label: 'Mixed sites score',
    fromField: 'nextcladeQcMixedSitesScoreFrom' as const,
    toField: 'nextcladeQcMixedSitesScoreTo' as const,
    type: 'integer' as QcFieldType,
  },
  {
    label: 'Private mutations score',
    fromField: 'nextcladeQcPrivateMutationsScoreFrom' as const,
    toField: 'nextcladeQcPrivateMutationsScoreTo' as const,
    type: 'integer' as QcFieldType,
  },
  {
    label: 'SNP clusters score',
    fromField: 'nextcladeQcSnpClustersScoreFrom' as const,
    toField: 'nextcladeQcSnpClustersScoreTo' as const,
    type: 'integer' as QcFieldType,
  },
  {
    label: 'Frame shifts score',
    fromField: 'nextcladeQcFrameShiftsScoreFrom' as const,
    toField: 'nextcladeQcFrameShiftsScoreTo' as const,
    type: 'integer' as QcFieldType,
  },
  {
    label: 'Stop codons score',
    fromField: 'nextcladeQcStopCodonsScoreFrom' as const,
    toField: 'nextcladeQcStopCodonsScoreTo' as const,
    type: 'integer' as QcFieldType,
  },
  {
    label: 'Coverage (from 0 to 1)',
    fromField: 'nextcladeCoverageFrom' as const,
    toField: 'nextcladeCoverageTo' as const,
    type: 'float' as QcFieldType,
  },
];

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
  'nextcladeCoverageFrom',
  'nextcladeCoverageTo',
] as const;

export function addQcSelectorToUrlSearchParams(selector: QcSelector, params: URLSearchParams) {
  for (const field of fields) {
    params.delete(field);
    if (selector[field] !== undefined) {
      params.set(field, selector[field]!.toString());
    }
  }
}

export function readQcSelectorFromUrlSearchParams(params: URLSearchParams): QcSelector {
  const qc: QcSelector = {};
  for (const field of fields) {
    if (params.has(field)) {
      qc[field] = Number.parseFloat(params.get(field)!);
    }
  }
  return qc;
}

export function isDefaultQcSelector(selector: QcSelector): boolean {
  for (let field of fields) {
    if (selector[field] !== undefined) {
      return false;
    }
  }
  return true;
}

export function formatQcSelectorAsString(selector: QcSelector): string {
  const stringComponents = [];
  for (let { label, fromField, toField } of qcFieldsAndLabels) {
    if (selector[fromField] !== undefined || selector[toField] !== undefined) {
      let s = '';
      if (selector[fromField] !== undefined) {
        s += `${selector[fromField]} ≤ `;
      }
      s += label;
      if (selector[toField] !== undefined) {
        s += ` ≤ ${selector[toField]}`;
      }
      stringComponents.push(s);
    }
  }
  return stringComponents.join(', ');
}
