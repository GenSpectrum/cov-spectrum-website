import { UnifiedDay } from '../../helpers/date-cache';

export type CountryDateCountSampleEntry = {
  date: UnifiedDay | null;
  country: string | null;
  count: number;
};
