import { UnifiedDay } from '../../helpers/date-cache';

export type DetailedSampleAggEntry = {
  date: UnifiedDay | null;
  region: string | null;
  country: string | null;
  division: string | null;
  age: number | null;
  sex: string | null;
  hospitalized: boolean | null;
  died: boolean | null;
  fullyVaccinated: boolean | null;
  count: number;
};
