import { UnifiedDay } from '../../helpers/date-cache';

export type HuismanScire2021ReResult = HuismanScire2021ReResultEntry[];

export type HuismanScire2021ReResultEntry = {
  date: UnifiedDay;
  re: number;
  reLow: number;
  reHigh: number;
};

export type HuismanScire2021ReResultResponse = {
  state: 'RESULT_AVAILABLE' | 'RESULT_UNAVAILABLE' | 'CALCULATION_FAILED';
  result: HuismanScire2021ReResult | null;
};

export type HuismanScire2021ReCalculateResponse = {
  state: 'OK' | 'REJECTED_FULL_QUEUE';
};
