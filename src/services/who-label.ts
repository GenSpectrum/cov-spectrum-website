export enum VariantType {
  CONCERN = 'concern',
  INTEREST = 'interest',
}

//from WHO website https://www.who.int/en/activities/tracking-SARS-CoV-2-variants/
export const WHO_LABELS: { [key: string]: { label: string; type: VariantType } | undefined } = {
  'B.1.1.7': {
    label: 'Alpha',
    type: VariantType.CONCERN,
  },
  'B.1.351': {
    label: 'Beta',
    type: VariantType.CONCERN,
  },
  'P.1': {
    label: 'Gamma',
    type: VariantType.CONCERN,
  },
  'B.1.617.2': {
    label: 'Delta',
    type: VariantType.CONCERN,
  },
  'B.1.427': {
    label: 'Epsilon',
    type: VariantType.INTEREST,
  },
  'B.1.429': {
    label: 'Epsilon',
    type: VariantType.INTEREST,
  },
  'P.2': {
    label: 'Zeta',
    type: VariantType.INTEREST,
  },
  'B.1.525': {
    label: 'Eta',
    type: VariantType.INTEREST,
  },
  'P.3': {
    label: 'Theta',
    type: VariantType.INTEREST,
  },
  'B.1.526': {
    label: 'Iota',
    type: VariantType.INTEREST,
  },
  'B.1.617.1': {
    label: 'Kappa',
    type: VariantType.INTEREST,
  },
  'B.1.621': {
    label: 'Mu',
    type: VariantType.INTEREST,
  },
  'C.37': {
    label: 'Lambda',
    type: VariantType.INTEREST,
  },
};

export const getWHOLabel = (pangoLineage: string): string | undefined => {
  return WHO_LABELS[pangoLineage.trim().replace(/\*/g, '')]?.label;
};

export const getWHOVariantType = (pangoLineage: string): VariantType | undefined => {
  return WHO_LABELS[pangoLineage.trim().replace(/\*/g, '')]?.type;
};
