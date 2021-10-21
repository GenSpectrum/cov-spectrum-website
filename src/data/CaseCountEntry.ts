import { globalDateCache, UnifiedDay } from '../helpers/date-cache';

export type CaseCountEntry = {
  region: string | null;
  country: string | null;
  division: string | null;
  date: UnifiedDay | null;
  age: number | null;
  sex: number | null;
  hospitalized: boolean | null;
  died: boolean | null;
  newCases: number;
  newDeaths: number;
};

export type CaseCountEntryRaw = Omit<CaseCountEntry, 'date'> & {
  date: string | null;
};

export function parseCaseCountEntry(raw: CaseCountEntryRaw): CaseCountEntry {
  return {
    ...raw,
    date: raw.date != null ? globalDateCache.getDay(raw.date) : null,
  };
}
