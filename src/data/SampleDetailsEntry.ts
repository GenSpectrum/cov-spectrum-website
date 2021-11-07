import { globalDateCache, UnifiedDay } from '../helpers/date-cache';

export type SampleDetailsEntry = {
  genbankAccession: string | null;
  sraAccession: string | null;
  gisaidEpiIsl: string | null;
  strain: string | null;
  date: UnifiedDay | null;
  dateSubmitted: UnifiedDay | null;
  region: string | null;
  country: string | null;
  division: string | null;
  location: string | null;
  regionExposure: string | null;
  countryExposure: string | null;
  divisionExposure: string | null;
  age: number | null;
  sex: string | null;
  hospitalized: boolean | null;
  died: boolean | null;
  fullyVaccinated: boolean | null;
  host: string | null;
  samplingStrategy: string | null;
  pangoLineage: string | null;
  nextstrainClade: string | null;
  gisaidCloade: string | null;
  submittingLab: string | null;
  originatingLab: string | null;
};

export type SampleDetailsEntryRaw = Omit<SampleDetailsEntry, 'date' | 'dateSubmitted'> & {
  date: string | null;
  dateSubmitted: string | null;
};

export function parseSampleDetailsEntry(raw: SampleDetailsEntryRaw): SampleDetailsEntry {
  return {
    ...raw,
    date: raw.date != null ? globalDateCache.getDay(raw.date) : null,
    dateSubmitted: raw.dateSubmitted != null ? globalDateCache.getDay(raw.dateSubmitted) : null,
  };
}

export function serializeSampleDetailsEntryToRaw(entry: SampleDetailsEntry): SampleDetailsEntryRaw {
  return {
    ...entry,
    date: entry.date != null ? entry.date.string : null,
    dateSubmitted: entry.dateSubmitted != null ? entry.dateSubmitted.string : null,
  };
}
