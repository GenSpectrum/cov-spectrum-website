import * as zod from 'zod';
import { AccountService } from './AccountService';
import {
  AgeDistributionEntrySchema,
  Country,
  InternationalTimeDistributionEntrySchema,
  TimeDistributionEntrySchema,
} from './api-types';

export enum DistributionType {
  Age = 'Age',
  Time = 'Time',
  International = 'International',
}

const HOST = process.env.REACT_APP_SERVER_HOST;

const getBaseHeaders = (): Headers => {
  const headers: { [key: string]: string } = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (AccountService.isLoggedIn()) {
    headers['Authorization'] = 'Bearer ' + AccountService.getJwt();
  }
  return new Headers(headers);
};

export const post = (endpoint: string, body: unknown) => {
  const url = HOST + endpoint;
  return fetch(url, {
    method: 'POST',
    headers: getBaseHeaders(),
    body: JSON.stringify(body),
  });
};

const getVariantEndpoint = (distributionType: DistributionType) => {
  switch (distributionType) {
    case 'Age':
      return '/plot/variant/age-distribution';
    case 'Time':
      return '/plot/variant/time-distribution';
    case 'International':
      return '/plot/variant/international-time-distribution';
    default:
      throw new Error(`unknown distributionType ${distributionType}`);
  }
};

const entrySchemaByDistributionType = {
  [DistributionType.Age]: AgeDistributionEntrySchema,
  [DistributionType.Time]: TimeDistributionEntrySchema,
  [DistributionType.International]: InternationalTimeDistributionEntrySchema,
};

type EntryType<D extends DistributionType> = zod.infer<typeof entrySchemaByDistributionType[D]>;

const getVariantRequestUrl = (
  distributionType: DistributionType,
  country: Country | null | undefined,
  mutations: string[],
  matchPercentage: number
) => {
  const endpoint = getVariantEndpoint(distributionType);
  const mutationsString = mutations.join(',');
  if (country) {
    return `${HOST}${endpoint}?country=${country}&mutations=${mutationsString}&matchPercentage=${matchPercentage}`;
  } else {
    return `${HOST}${endpoint}?mutations=${mutationsString}&matchPercentage=${matchPercentage}`;
  }
};

export const getVariantDistributionData = <D extends DistributionType>(
  distributionType: D,
  country: Country | null | undefined,
  mutations: string[],
  matchPercentage: number,
  signal?: AbortSignal
): Promise<EntryType<D>[]> => {
  const url = getVariantRequestUrl(distributionType, country, mutations, matchPercentage);
  // console.log('Fetching variant request', url);
  return fetch(url, {
    headers: getBaseHeaders(),
    signal,
  })
    .then(response => {
      return response.json();
    })
    .then(distributionData => {
      return zod
        .array(entrySchemaByDistributionType[distributionType])
        .parse(distributionData) as EntryType<D>[];
    })
    .catch(e => {
      console.log('Error fetching', e);
      return e;
    });
};

export const getSamples = (
  mutationsString: string,
  matchPercentage: number,
  country: string | null | undefined,
  signal?: AbortSignal
) => {
  let url = HOST + `/resource/sample/?mutations=${mutationsString}&matchPercentage=${matchPercentage}`;
  if (country) {
    url += `&country=${country}`;
  }
  return fetch(url, { headers: getBaseHeaders(), signal }).then(response => response.json());
};

export const getGrowingVariants = (year: number, week: number, country: string, signal?: AbortSignal) => {
  const endpoint = `/computed/find-growing-variants?year=${year}&week=${week}&country=${country}`;
  const url = HOST + endpoint;
  return fetch(url, { headers: getBaseHeaders(), signal }).then(response => response.json());
};

export const getVariants = () => {
  const url = HOST + '/resource/variant';
  return fetch(url, { headers: getBaseHeaders() }).then(response => response.json());
};

export const getCurrentWeek = () => {
  const url = HOST + '/utils/current-week';
  return fetch(url, { headers: getBaseHeaders() }).then(response => response.json());
};

export const getCountries = () => {
  const url = HOST + '/resource/country';
  return fetch(url, { headers: getBaseHeaders() }).then(response => response.json());
};
export const fetchTimeDistributionData = () => {};
