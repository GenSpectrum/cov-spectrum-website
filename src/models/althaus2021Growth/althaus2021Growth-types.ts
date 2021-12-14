export type Althaus2021GrowthParametersAttribute =
  | 'growthRate'
  | 'transmissibilityIncrease'
  | 'durationIncrease'
  | 'immuneEvasion'
  | 'susceptiblesProportion'
  | 'reproductionNumberWildtype'
  | 'generationTime';

export type Althaus2021GrowthParameters = {
  growthRate: number;
  transmissibilityIncrease: number;
  durationIncrease: number;
  immuneEvasion: number;
  susceptiblesProportion: number;
  reproductionNumberWildtype: number;
  generationTime: number;
};
