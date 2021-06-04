import * as zod from 'zod';
import { NewSampleSelector } from '../helpers/sample-selector';
import { SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import { defaultForNever, unreachable } from '../helpers/unreachable';
import { AccountService } from './AccountService';
import {
  Country,
  Region,
  Place,
  CountrySchema,
  InterestingVariantResult,
  RawMultiSample,
  SampleResultList,
  SampleResultListSchema,
  SequencingIntensityEntrySchema,
  PangolinLineageListSchema,
  PangolinLineageList,
  PangolinLineageInformationSchema,
  PangolinLineageInformation,
  Article,
  ArticleSchema,
  DataStatus,
  DataStatusSchema,
  SequencingRepresentativenessSelector,
  CaseCountEntry,
  CaseCountEntrySchema,
} from './api-types';
import dayjs from 'dayjs';
import {
  SequencingIntensityEntrySetSelector,
  SequencingIntensityEntrySetWithSelector,
} from '../helpers/sequencing-intensity-entry-set';

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

export type DateRange = 'AllTimes' | 'Past3M' | 'Past6M' | 'Y2020' | 'Y2021';

export function isDateRange(s: unknown): s is DateRange {
  const _s = s as DateRange;
  switch (_s) {
    case 'AllTimes':
    case 'Past3M':
    case 'Past6M':
    case 'Y2020':
    case 'Y2021':
      return true;
    default:
      return defaultForNever(_s, false);
  }
}

export function dateRangeToDates(
  dateRange: DateRange
): {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
} {
  switch (dateRange) {
    case 'AllTimes':
      return {
        dateFrom: undefined,
        dateTo: undefined,
      };
    case 'Past3M':
      return {
        dateFrom: dayjs().subtract(3, 'months').day(1).toDate(),
        dateTo: undefined,
      };
    case 'Past6M':
      return {
        dateFrom: dayjs().subtract(6, 'months').day(1).toDate(),
        dateTo: undefined,
      };
    case 'Y2020':
      // The dates are chosen so that the date range always starts on a monday and ends on a Sunday.
      return {
        dateFrom: new Date('2020-01-06'),
        dateTo: new Date('2021-01-03'),
      };
    case 'Y2021':
      // The dates are chosen so that the date range always starts on a monday and ends on a Sunday.
      return {
        dateFrom: new Date('2021-01-04'),
        dateTo: new Date('2022-01-02'),
      };
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
  if (country && isRegion(country)) {
    url += `&region=${country}`;
  } else if (country) {
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
      const newParam = selector[k]!.toString();
      if (k === 'country' && isRegion(newParam)) {
        params.set('region', newParam);
      } else {
        params.set(k, newParam);
      }
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
  if (country && isRegion(country)) {
    url += `&region=${country}`;
  } else if (country) {
    url += `&country=${country}`;
  }
  if (samplingStrategy) {
    url += `&dataType=${samplingStrategy}`;
  }
  return url;
};

// TODO We might want to merge this function with getNewSamples() as it uses the same endpoint.
export const getPangolinLineages = (
  {
    country,
    samplingStrategy,
    pangolinLineage,
    dateFrom,
    dateTo,
    mutationsString,
    matchPercentage,
  }: {
    country: Country;
    samplingStrategy: SamplingStrategy;
    pangolinLineage?: string;
    dateFrom?: string;
    dateTo?: string;
    mutationsString?: string;
    matchPercentage?: number;
  },
  signal?: AbortSignal
): Promise<PangolinLineageList> => {
  let url = HOST + `/resource/sample2?fields=pangolinLineage`;
  if (isRegion(country)) {
    url += `&region=${country}`;
  } else {
    url += `&country=${country}`;
  }
  const literalSamplingStrategy = toLiteralSamplingStrategy(samplingStrategy);
  if (literalSamplingStrategy) {
    url += `&dataType=${literalSamplingStrategy}`;
  }
  if (dateFrom) {
    url += `&dateFrom=${dateFrom}`;
  }
  if (dateTo) {
    url += `&dateTo=${dateTo}`;
  }
  if (pangolinLineage) {
    url += `&pangolinLineage=${pangolinLineage}`;
  }
  if (mutationsString) {
    url += `&mutations=${mutationsString}`;
  }
  if (matchPercentage) {
    url += `&matchPercentage=${matchPercentage}`;
  }
  return fetch(url, { headers: getBaseHeaders(), signal })
    .then(response => response.json())
    .then(data => {
      return PangolinLineageListSchema.parse(data);
    });
};

export async function getInformationOfPangolinLineage(
  {
    pangolinLineage,
    region,
    country,
    dateFrom,
    dateTo,
  }: {
    pangolinLineage: string;
    region?: string;
    country?: string;
    dateFrom?: Date;
    dateTo?: Date;
  },
  signal?: AbortSignal
): Promise<PangolinLineageInformation> {
  const params = new URLSearchParams();
  if (region) {
    params.set('region', region);
  } else if (country && isRegion(country)) {
    params.set('region', country);
  } else if (country) {
    params.set('country', country);
  }
  if (dateFrom) {
    params.set('dateFrom', dayjs(dateFrom).format('YYYY-MM-DD'));
  }
  if (dateTo) {
    params.set('dateTo', dayjs(dateTo).format('YYYY-MM-DD'));
  }
  const url = `/resource/pangolin-lineage/${pangolinLineage}?${params.toString()}`;
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('server responded with non-200 status code');
  }
  return PangolinLineageInformationSchema.parse(await res.json());
}

export const getSequencingIntensity = (
  selector: SequencingIntensityEntrySetSelector,
  signal?: AbortSignal
): Promise<SequencingIntensityEntrySetWithSelector> => {
  let url = HOST + `/plot/sequencing/time-intensity-distribution?`;
  if (!selector.country) {
    // TODO should be addressed in #101
    return Promise.resolve({
      data: [],
      selector,
    });
  }
  if (isRegion(selector.country)) {
    url += `region=${selector.country}`;
  } else {
    url += `country=${selector.country}`;
  }
  if (selector.samplingStrategy) {
    url += `&dataType=${selector.samplingStrategy}`;
  }
  return fetch(url, { headers: getBaseHeaders(), signal })
    .then(response => response.json())
    .then(data => {
      return {
        data: zod.array(SequencingIntensityEntrySchema).parse(data),
        selector,
      };
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
  let endpoint = `/computed/find-interesting-variants?`;
  if (isRegion(country)) {
    endpoint += `region=${country}`;
  } else {
    endpoint += `country=${country}`;
  }
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

export const getRegions = (): Promise<Region[]> => {
  const url = HOST + '/resource/region';
  return fetch(url, { headers: getBaseHeaders() })
    .then(response => response.json())
    .then(data => zod.array(CountrySchema).parse(data));
};

//temp until better solution
export const isRegion = (place: Place): boolean => {
  const regions = ['Africa', 'Europe', 'Asia', 'North America', 'South America', 'Oceania'];
  return regions.includes(place);
};

export const getPlaces = async (): Promise<Place[]> => {
  const countries = await getCountries();
  const regions = await getRegions();
  return regions.concat(countries);
};

export const fetchTimeDistributionData = () => {};

export async function getArticles(
  { pangolinLineage }: { pangolinLineage: string },
  signal?: AbortSignal
): Promise<Article[]> {
  const url = '/resource/article?pangolinLineage=' + pangolinLineage;
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('server responded with non-200 status code');
  }
  return zod.array(ArticleSchema).parse(await res.json());
}

export async function getDataStatus(signal?: AbortSignal): Promise<DataStatus> {
  const url = '/data-status';
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('server responded with non-200 status code');
  }
  return DataStatusSchema.parse(await res.json());
}

export async function getCaseCounts(
  { dateFrom, dateTo, country }: SequencingRepresentativenessSelector,
  signal?: AbortSignal
): Promise<CaseCountEntry[]> {
  if (country !== 'Switzerland') {
    throw new Error('getCaseCounts() is currently only available for Switzerland.');
  }
  const params = new URLSearchParams();
  params.set('country', country);
  if (dateFrom) {
    params.set('dateFrom', dateFrom);
  }
  if (dateTo) {
    params.set('dateTo', dateTo);
  }
  const url = '/resource/case?' + params.toString();
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('server responded with non-200 status code');
  }
  return zod.array(CaseCountEntrySchema).parse(await res.json());
}
