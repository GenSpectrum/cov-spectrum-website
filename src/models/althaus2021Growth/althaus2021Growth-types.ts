export type Althaus2021GrowthParametersAttribute =
  | 'transmissibilityIncrease'
  | 'durationIncrease'
  | 'immuneEvasion'
  | 'susceptiblesProportion'
  | 'reproductionNumberWildtype'
  | 'generationTime';

export type Althaus2021GrowthParameters = {
  transmissibilityIncrease: number;
  durationIncrease: number;
  immuneEvasion: number;
  susceptiblesProportion: number;
  reproductionNumberWildtype: number;
  generationTime: number;
};
