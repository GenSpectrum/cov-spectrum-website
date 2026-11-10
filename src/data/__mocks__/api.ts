import { CountryMapping } from '../CountryMapping';
import { CaseCountEntry } from '../CaseCountEntry';
import { Collection } from '../Collection';
import { PangoLineageAlias } from '../PangoLineageAlias';
import { PangoLineageRecombinant } from '../PangoLineageRecombinant';
import { ReferenceGenomeInfo } from '../ReferenceGenomeInfo';
import { UserCountry } from '../UserCountry';
import { globalDateCache } from '../../helpers/date-cache';

export async function fetchCountryMapping(): Promise<CountryMapping[]> {
  return Promise.resolve([
    {
      covSpectrumName: 'Switzerland',
      gisaidName: 'Switzerland',
      region: 'Europe',
    },
    {
      covSpectrumName: 'Germany',
      gisaidName: 'Germany',
      region: 'Europe',
    },
  ]);
}

export async function fetchPangoLineageAliases(): Promise<PangoLineageAlias[]> {
  return Promise.resolve([
    {
      alias: 'mockAlias',
      fullName: 'mockFullName',
    },
  ]);
}

export async function fetchPangoLineageRecombinant(): Promise<PangoLineageRecombinant[]> {
  return [];
}

export async function fetchReferenceGenomeInfo(): Promise<ReferenceGenomeInfo> {
  return Promise.resolve({
    nucSeq: 'A'.repeat(30000),
    genes: [
      {
        name: 'S',
        startPosition: 1,
        endPosition: 3000,
        aaSeq: 'A'.repeat(1000),
      },
    ],
  });
}

export async function fetchCurrentUserCountry(): Promise<UserCountry> {
  return {
    region: 'Europe',
    country: 'Switzerland',
  };
}

export const fetchCaseCounts = vi.fn(async (): Promise<CaseCountEntry[]> => {
  return [
    {
      region: 'Europe',
      country: 'Switzerland',
      division: null,
      date: globalDateCache.getDay('2024-01-01'),
      age: null,
      sex: null,
      hospitalized: null,
      died: null,
      newCases: 10,
      newDeaths: 0,
    },
  ];
});

export const fetchCollections = vi.fn(async (): Promise<Collection[]> => {
  return [
    {
      id: 1,
      title: "Editor's choice",
      description: 'Variants used by smoke tests',
      maintainers: 'CoV-Spectrum team',
      email: 'test@example.com',
      variants: [],
    },
  ];
});
