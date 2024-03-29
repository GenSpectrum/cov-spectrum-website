import { CountryMapping } from '../CountryMapping';
import { PangoLineageAlias } from '../PangoLineageAlias';
import { ReferenceGenomeInfo } from '../ReferenceGenomeInfo';
import { UserCountry } from '../UserCountry';

export async function fetchCountryMapping(): Promise<CountryMapping[]> {
  return Promise.resolve([
    {
      covSpectrumName: 'mockCovSpectrumName',
      gisaidName: 'mockGisaidName',
      region: 'mockRegion',
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

export async function fetchReferenceGenomeInfo(): Promise<ReferenceGenomeInfo> {
  return Promise.resolve({
    nucSeq: 'mockAlias',
    genes: [
      {
        name: 'mockGene',
        startPosition: 123,
        endPosition: 456,
        aaSeq: 'mockSequence',
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
