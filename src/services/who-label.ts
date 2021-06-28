export enum VariantType {
  CONCERN = 'Concern',
  INTEREST = 'Interest',
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
};

export const getWHOLabel = (pangoLineage: string): string | undefined => {
  return WHO_LABELS[pangoLineage.trim().replace(/\*/g, '')]?.label;
};

export const getWHOVariantType = (pangoLineage: string): VariantType | undefined => {
  return WHO_LABELS[pangoLineage.trim()]?.type;
};
