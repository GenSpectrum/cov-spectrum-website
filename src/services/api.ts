import * as zod from 'zod';
import { NewSampleSelector } from '../helpers/sample-selector';
import { SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import { defaultForNever, unreachable } from '../helpers/unreachable';
import { AccountService } from './AccountService';
import {
  AgeDistributionEntrySchema,
  Country,
  CountrySchema,
  InterestingVariantResult,
  InternationalTimeDistributionEntrySchema,
  MultiSample,
  SampleResultList,
  SampleResultListSchema,
  TimeDistributionEntrySchema,
  TimeZipCodeDistributionEntrySchema,
} from './api-types';

export enum DistributionType {
  Age = 'Age',
  Time = 'Time',
  International = 'International',
  TimeZipCode = 'TimeZipCode',
}

// WARNING These values are used in URLs - be careful when changing them
export enum SamplingStrategy {
  AllSamples = 'AllSamples',
  Surveillance = 'Surveillance',
}

export const LiteralSamplingStrategySchema = zod.literal('SURVEILLANCE').optional();
export type LiteralSamplingStrategy = zod.infer<typeof LiteralSamplingStrategySchema>;

export function toLiteralSamplingStrategy(samplingStrategy: SamplingStrategy): LiteralSamplingStrategy {
  switch (samplingStrategy) {
    case SamplingStrategy.AllSamples:
      return undefined;
    case SamplingStrategy.Surveillance:
      return 'SURVEILLANCE';
    default:
      unreachable(samplingStrategy);
  }
}

export function isSamplingStrategy(s: unknown): s is SamplingStrategy {
  const _s = s as SamplingStrategy;
  switch (_s) {
    case SamplingStrategy.AllSamples:
    case SamplingStrategy.Surveillance:
      return true;
    default:
      return defaultForNever(_s, false);
  }
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

export const get = (endpoint: string, signal?: AbortSignal) => {
  const url = HOST + endpoint;
  return fetch(url, {
    method: 'GET',
    headers: getBaseHeaders(),
    signal,
  });
};

export const post = (endpoint: string, body: unknown, signal?: AbortSignal) => {
  const url = HOST + endpoint;
  return fetch(url, {
    method: 'POST',
    headers: getBaseHeaders(),
    body: JSON.stringify(body),
    signal,
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
    case DistributionType.TimeZipCode:
      return '/plot/variant/time-zip-code-distribution';
    default:
      throw new Error(`unknown distributionType ${distributionType}`);
  }
};

const entrySchemaByDistributionType = {
  [DistributionType.Age]: AgeDistributionEntrySchema,
  [DistributionType.Time]: TimeDistributionEntrySchema,
  [DistributionType.International]: InternationalTimeDistributionEntrySchema,
  [DistributionType.TimeZipCode]: TimeZipCodeDistributionEntrySchema,
};

type EntryType<D extends DistributionType> = zod.infer<typeof entrySchemaByDistributionType[D]>;

const getVariantRequestUrl = ({
  distributionType,
  country,
  mutations,
  matchPercentage,
  samplingStrategy,
}: {
  distributionType: DistributionType;
  country: Country | null | undefined;
  mutations: string[];
  matchPercentage: number;
  samplingStrategy: LiteralSamplingStrategy;
}) => {
  const endpoint = getVariantEndpoint(distributionType);
  const mutationsString = mutations.join(',');
  let url = `${HOST}${endpoint}?mutations=${mutationsString}&matchPercentage=${matchPercentage}`;
  if (country) {
    url += `&country=${country}`;
  }
  if (samplingStrategy) {
    if (distributionType === DistributionType.International) {
      throw new Error('samplingStrategy is not supported with DistributionType.International');
    }
    url += `&dataType=${samplingStrategy}`;
  }
  return url;
};

export const getVariantDistributionData = <D extends DistributionType>(
  {
    distributionType,
    country,
    mutations,
    matchPercentage,
    samplingStrategy,
  }: {
    distributionType: D;
    country: Country | null | undefined;
    mutations: string[];
    matchPercentage: number;
    samplingStrategy: LiteralSamplingStrategy;
  },
  signal?: AbortSignal
): Promise<EntryType<D>[]> => {
  const url = getVariantRequestUrl({
    distributionType,
    country,
    mutations,
    matchPercentage,
    samplingStrategy,
  });
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
  {
    mutationsString,
    matchPercentage,
    country,
    samplingStrategy,
  }: {
    mutationsString: string;
    matchPercentage: number;
    country: string | null | undefined;
    samplingStrategy: LiteralSamplingStrategy;
  },
  signal?: AbortSignal
): Promise<SampleResultList> => {
  let url = HOST + `/resource/sample/?mutations=${mutationsString}&matchPercentage=${matchPercentage}`;
  if (country) {
    url += `&country=${country}`;
  }
  if (samplingStrategy) {
    url += `&dataType=${samplingStrategy}`;
  }
  return fetch(url, { headers: getBaseHeaders(), signal })
    .then(response => response.json())
    .then(data => SampleResultListSchema.parse(data));
};

export async function getNewSamples(
  selector: NewSampleSelector,
  signal?: AbortSignal
): Promise<SampleSetWithSelector> {
  const params = new URLSearchParams();
  if (selector.mutations?.length) {
    params.set('mutations', selector.mutations.join(','));
  }
  for (const k of ['region', 'country', 'matchPercentage', 'dataType', 'dateFrom', 'dateTo'] as const) {
    if (selector[k]) {
      params.set(k, selector[k]!.toString());
    }
  }

  const res = await get(`/resource/sample2?${params.toString()}`, signal);
  if (!res.ok) {
    throw new Error('server responded with non-200 status code');
  }

  // TODO(voinovp) HACK don't actually parse because zod is slow
  // const data = zod.array(MultiSampleSchema).parse(await res.json());
  const data = (await res.json()) as MultiSample[];

  return new SampleSet(data, selector);
}

export const getSampleFastaUrl = ({
  mutationsString,
  matchPercentage,
  country,
  samplingStrategy,
}: {
  mutationsString: string;
  matchPercentage: number;
  country: string | null | undefined;
  samplingStrategy: LiteralSamplingStrategy;
}): string => {
  let url = HOST + `/resource/sample-fasta?mutations=${mutationsString}&matchPercentage=${matchPercentage}`;
  if (country) {
    url += `&country=${country}`;
  }
  if (samplingStrategy) {
    url += `&dataType=${samplingStrategy}`;
  }
  return url;
};

export const getInterestingVariants = (
  {
    country,
  }: {
    country: string;
  },
  signal?: AbortSignal
): Promise<InterestingVariantResult> => {
  const endpoint = `/computed/find-interesting-variants?country=${country}`;
  const url = HOST + endpoint;
  return fetch(url, { headers: getBaseHeaders(), signal })
    .then(response => response.json())
    .then(data => {
      // TODO(voinovp) HACK don't actually parse because zod is slow
      // return InterestingVariantResultSchema.parse(data);
      return data as InterestingVariantResult;
    });
};

export const getCurrentWeek = (): Promise<number> => {
  const url = HOST + '/utils/current-week';
  return fetch(url, { headers: getBaseHeaders() })
    .then(response => response.json())
    .then(data => zod.number().parse(data));
};

export const getCountries = (): Promise<Country[]> => {
  const url = HOST + '/resource/country';
  return fetch(url, { headers: getBaseHeaders() })
    .then(response => response.json())
    .then(data => zod.array(CountrySchema).parse(data));
};

export const fetchTimeDistributionData = () => {};
