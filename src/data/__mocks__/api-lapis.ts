import { NextcladeDatasetInfo } from '../NextcladeDatasetInfo';
import { AgeCountSampleEntry } from '../sample/AgeCountSampleEntry';
import { CountryDateCountSampleEntry } from '../sample/CountryDateCountSampleEntry';
import { DatelessCountrylessCountSampleEntry } from '../sample/DatelessCountrylessCountSampleEntry';
import { DateCountSampleEntry } from '../sample/DateCountSampleEntry';
import { DivisionCountSampleEntry } from '../sample/DivisionCountSampleEntry';
import { HostCountSampleEntry } from '../sample/HostCountSampleEntry';
import { InsertionCountEntry } from '../InsertionCountEntry';
import { MutationProportionEntry } from '../MutationProportionEntry';
import { MutationsOverTimeResponse } from '../MutationsOverTimeResponse';
import { globalDateCache } from '../../helpers/date-cache';

export async function fetchAllHosts(): Promise<string[]> {
  return Promise.resolve(['mockHost']);
}

export async function fetchLapisDataVersion(): Promise<string> {
  return 'mockVersion';
}

export async function fetchNextcladeDatasetInfo(): Promise<NextcladeDatasetInfo> {
  return { name: 'mockName', tag: null };
}

export const checkSiloAvailability = vi.fn();

export const fetchDateCountSamples = vi.fn(async (): Promise<DateCountSampleEntry[]> => {
  return [
    { date: globalDateCache.getDay('2024-01-01'), count: 100 },
    { date: globalDateCache.getDay('2024-01-08'), count: 120 },
  ];
});

export const fetchAgeCountSamples = vi.fn(async (): Promise<AgeCountSampleEntry[]> => {
  return [
    { age: 20, count: 20 },
    { age: 40, count: 40 },
  ];
});

export const fetchDivisionCountSamples = vi.fn(async (): Promise<DivisionCountSampleEntry[]> => {
  return [
    { region: 'Europe', country: 'Switzerland', division: 'Zurich', count: 40 },
    { region: 'Europe', country: 'Switzerland', division: 'Geneva', count: 20 },
  ];
});

export const fetchCountryDateCountSamples = vi.fn(async (): Promise<CountryDateCountSampleEntry[]> => {
  return [
    { country: 'Switzerland', date: globalDateCache.getDay('2024-01-01'), count: 40 },
    { country: 'Germany', date: globalDateCache.getDay('2024-01-01'), count: 60 },
  ];
});

export const fetchDatelessCountrylessCountSamples = vi.fn(
  async (): Promise<DatelessCountrylessCountSampleEntry[]> => {
    return [{ division: null, age: null, sex: null, hospitalized: null, died: null, count: 100 }];
  }
);

export const fetchPangoLineageCountSamples = vi.fn(async () => {
  return [{ pangoLineage: 'BA.2', count: 10 }];
});

export const fetchHostCountSamples = vi.fn(async (): Promise<HostCountSampleEntry[]> => {
  return [{ host: 'Human', count: 100 }];
});

export const fetchSamplesCount = vi.fn(async (): Promise<number> => 120);

export const fetchMutationProportions = vi.fn(async (): Promise<MutationProportionEntry[]> => {
  return [{ mutation: 'S:N501Y', proportion: 0.5, count: 60 }];
});

export const fetchInsertionCounts = vi.fn(async (): Promise<InsertionCountEntry[]> => {
  return [{ insertion: 'ins_S:214:EPE', count: 5 }];
});

export const fetchMutationsOverTime = vi.fn(async (): Promise<MutationsOverTimeResponse> => {
  return {
    mutations: ['S:N501Y'],
    dateRanges: [{ dateFrom: '2024-01-01', dateTo: '2024-01-08' }],
    data: [[{ count: 10, coverage: 100 }]],
  };
});

export const getCsvLinkToDetails = vi.fn(async (): Promise<string> => 'https://example.com/details.csv');

export const getLinkToFasta = vi.fn(async (): Promise<string> => 'https://example.com/sequences.fasta');

export const _fetchAggSamples = vi.fn(async () => {
  return [{ nextstrainClade: '22B', count: 10 } as any];
});
