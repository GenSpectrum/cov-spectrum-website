import { ParsedMultiSample } from './sample-set';

export const switzerlandRegions = [
  {
    name: 'Region 1 (GE, NE, VD, VS)',
    divisions: ['Geneva', 'Neuchâtel', 'Vaud', 'Valais'],
  },
  {
    name: 'Region 2 (BE, FR, JU)',
    divisions: ['Bern', 'Fribourg', 'Jura'],
  },
  {
    name: 'Region 3 (AG, BL, BS, SO)',
    divisions: ['Aargau', 'Basel-Land', 'Basel-Stadt', 'Solothurn'],
  },
  {
    name: 'Region 4 (LU, NW, OW, SZ, UR, ZG)',
    divisions: ['Lucerne', 'Nidwalden', 'Obwalden', 'Schwyz', 'Uri', 'Zug'],
  },
  {
    name: 'Region 5 (AI, AR, GL, SG, SH, TG, ZH)',
    divisions: [
      'Zürich',
      'Schaffhausen',
      'Thurgau',
      'Sankt Gallen',
      'Appenzell Innerhoden',
      'Appenzell Ausserhoden',
    ],
  },
  {
    name: 'Region 6 (GR, TI)',
    divisions: ['Graubünden', 'Ticino'],
  },
];

const cantonToRegionMap = new Map<string, string>();
for (let { divisions, name } of switzerlandRegions) {
  for (let division of divisions) {
    cantonToRegionMap.set(division, name);
  }
}

export const cantonToRegion = (canton: string) => cantonToRegionMap.get(canton);

export const mapParsedMultiSample = (samples: ParsedMultiSample[]): ParsedMultiSample[] => {
  return samples.map(sample => ({
    ...sample,
    division: sample.division === null ? null : cantonToRegion(sample.division) ?? null,
  }));
};
