import { globalDateCache, UnifiedDay } from '../../helpers/date-cache';

export type FullSampleAggEntry = {
  date: UnifiedDay | null;
  region: string | null;
  country: string | null;
  division: string | null;
  age: number | null;
  sex: string | null;
  hospitalized: boolean | null;
  died: boolean | null;
  fullyVaccinated: boolean | null;
  pangoLineage: string | null;
  // TODO Add missing fields
  count: number;
};

export type FullSampleAggEntryRaw = Omit<FullSampleAggEntry, 'date'> & {
  date: string | null;
};

export function parseFullSampleAggEntry(raw: FullSampleAggEntryRaw): FullSampleAggEntry {
  return {
    ...raw,
    date: raw.date != null ? globalDateCache.getDay(raw.date) : null,
  };
}
