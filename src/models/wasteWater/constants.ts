export const wastewaterVariantColors: {
  [key: string]: string;
} = {
  'B.1.1.7': '#D16666',
  'B.1.351': '#FF6665',
  'P.1': '#FFB3B3',
  'B.1.617.1': '#66C265',
  'B.1.617.2': '#66A366',
  'BA.1': '#A366A3',
  'BA.2': '#CFAFCF',
  'BA.4': '#8A66FF',
  'BA.5': '#585EFF',
  'BA.2.12.1': '#0400E0',
  'BA.2.75': '#008FE0',
  'BA.2.75.2': '$208FE0',
  'BQ.1.1': '#AC00E0',
  'XBB.1.9': '#BB6A33',
  'XBB.1.5': '#FF5656',
  'XBB.1.16': '#E99B30',
  'XBB.2.3': '#F5E424',
  'EG.5': '#B4E80B',
  'BA.2.86': '#FF20E0',
  'JN.1': '#00E9FF', // improv, not in sync with covariants.org
  'BA.2.87.1': '#56ACBC', //improv, not in sync with covariants.org
  'KP.2': '#876566', //improv not in sync with covariants.org
  'KP.3': '#331eee',
  "XEC": "#a2a626", //improv not in sync with covariants.org
  'undetermined': '#969696',
};

export const discontinuedLocations = new Set<string>([
  'Sierre/Noes (VS)',
  'Lausanne (VD)',
  'Sion (VS)',
  'Bern (BE)',
  'Porrentruy (JU)',
  'Neuchâtel (NE)',
  'Solothurn (SO)',
  'Schwyz (SZ)',
  'test_legacylocation', // for tests
]);

export const discontinuedDate = ' since March 26th, 2024';
