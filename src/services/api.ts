import * as zod from 'zod';
import { NewSampleSelector } from '../helpers/sample-selector';
import { SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import { defaultForNever, unreachable } from '../helpers/unreachable';
import { AccountService } from './AccountService';
import {
  Country,
  CountrySchema,
  InterestingVariantResult,
  RawMultiSample,
  SampleResultList,
  SampleResultListSchema,
  SequencingIntensityEntrySchema,
  SequencingIntensityEntry,
  PangolinLineageListSchema,
  PangolinLineageList,
} from './api-types';

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

export const getSamples = (
  {
    pangolinLineage,
    mutationsString,
    matchPercentage,
    country,
    samplingStrategy,
  }: {
    pangolinLineage?: string;
    mutationsString?: string;
    matchPercentage: number;
    country: string | null | undefined;
    samplingStrategy: LiteralSamplingStrategy;
  },
  signal?: AbortSignal
): Promise<SampleResultList> => {
  let url = HOST + `/resource/sample/?matchPercentage=${matchPercentage}`;
  if (pangolinLineage?.length) {
    url += `&pangolinLineage=${pangolinLineage}`;
  }
  if (mutationsString?.length) {
    url += `&mutations=${mutationsString}`;
  }
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
  for (const k of [
    'region',
    'country',
    'matchPercentage',
    'dataType',
    'dateFrom',
    'dateTo',
    'pangolinLineage',
  ] as const) {
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
  const data = (await res.json()) as RawMultiSample[];

  return SampleSet.fromRawSamples(data, selector);
}

export const getSampleFastaUrl = ({
  pangolinLineage,
  mutationsString,
  matchPercentage,
  country,
  samplingStrategy,
}: {
  pangolinLineage?: string;
  mutationsString?: string;
  matchPercentage: number;
  country: string | null | undefined;
  samplingStrategy: LiteralSamplingStrategy;
}): string => {
  let url = HOST + `/resource/sample-fasta?matchPercentage=${matchPercentage}`;
  if (pangolinLineage?.length) {
    url += `&pangolinLineage=${pangolinLineage}`;
  }
  if (mutationsString?.length) {
    url += `&mutations=${mutationsString}`;
  }
  if (country) {
    url += `&country=${country}`;
  }
  if (samplingStrategy) {
    url += `&dataType=${samplingStrategy}`;
  }
  return url;
};

export const getPangolinLineages = (
  {
    country,
    samplingStrategy,
    dateFrom,
  }: {
    country: Country;
    samplingStrategy: SamplingStrategy;
    dateFrom?: string;
  },
  signal?: AbortSignal
): Promise<PangolinLineageList> => {
  let url = HOST + `/resource/sample2?fields=pangolinLineage&country=${country}`;
  const literalSamplingStrategy = toLiteralSamplingStrategy(samplingStrategy);
  if (literalSamplingStrategy) {
    url += `&dataType=${literalSamplingStrategy}`;
  }
  if (dateFrom) {
    url += `&dateFrom=${dateFrom}`;
  }
  return fetch(url, { headers: getBaseHeaders(), signal })
    .then(response => response.json())
    .then(data => {
      return PangolinLineageListSchema.parse(data);
    });
};

export const getSequencingIntensity = ({
  country,
  signal,
}: {
  country: Country;
  dataType?: SamplingStrategy;
  signal: AbortSignal;
}): Promise<SequencingIntensityEntry[]> => {
  let url = HOST + `/plot/sequencing/time-intensity-distribution?country=${country}`;
  return fetch(url, { headers: getBaseHeaders(), signal })
    .then(response => response.json())
    .then(data => {
      return zod.array(SequencingIntensityEntrySchema).parse(data);
    });
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

export const getCountries = (): Promise<Country[]> => {
  const url = HOST + '/resource/country';
  return fetch(url, { headers: getBaseHeaders() })
    .then(response => response.json())
    .then(data => zod.array(CountrySchema).parse(data));
};

export const fetchTimeDistributionData = () => {};
