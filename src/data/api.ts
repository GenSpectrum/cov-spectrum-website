import { CaseCountEntry, CaseCountEntryRaw, parseCaseCountEntry } from './CaseCountEntry';
import { LocationDateSelector } from './LocationDateSelector';
import { addLocationSelectorToUrlSearchParams } from './LocationSelector';
import { addDateRangeSelectorToUrlSearchParams } from './DateRangeSelector';
import { ArticleEntry, ArticleEntryRaw, parseArticleEntry } from './ArticleEntry';
import { PangoLineageAlias } from './PangoLineageAlias';
import { CountryMapping } from './CountryMapping';
import { AccountService } from '../services/AccountService';
import { ReferenceGenomeInfo } from './ReferenceGenomeInfo';
import { UserCountry } from './UserCountry';

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

export async function fetchCurrentUserCountry(signal?: AbortSignal): Promise<UserCountry> {
  const res = await get('/internal/my-country', signal);
  if (!res.ok) {
    throw new Error('Error fetching case data data');
  }
  return (await res.json()) as UserCountry;
}

export async function fetchCaseCounts(
  selector: LocationDateSelector,
  signal?: AbortSignal,
  fields?: string[]
): Promise<CaseCountEntry[]> {
  const params = new URLSearchParams();
  // We are not fetching age, sex, hospitalized and died because they are currently not useful
  params.set('fields', (fields ?? ['region', 'country', 'division', 'date']).join(','));
  addLocationSelectorToUrlSearchParams(selector.location, params);
  if (selector.dateRange) {
    addDateRangeSelectorToUrlSearchParams(selector.dateRange, params);
  }

  const res = await get(`/resource/case?${params.toString()}`, signal);
  if (!res.ok) {
    throw new Error('Error fetching new case data');
  }
  const body = (await res.json()) as CaseCountEntryRaw[];
  return body.map(raw => parseCaseCountEntry(raw));
}

export async function fetchArticles(pangoLineage: string, signal?: AbortSignal): Promise<ArticleEntry[]> {
  const params = new URLSearchParams();
  params.set('pangoLineage', pangoLineage);

  const res = await get(`/resource/article?${params.toString()}`, signal);
  if (!res.ok) {
    throw new Error('Error fetching case data data');
  }
  const body = (await res.json()) as ArticleEntryRaw[];
  return body.map(raw => parseArticleEntry(raw));
}

export async function fetchPangoLineageAliases(signal?: AbortSignal): Promise<PangoLineageAlias[]> {
  const url = '/resource/pango-lineage-alias';
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('Error fetching pango lineage aliases');
  }
  return (await res.json()) as PangoLineageAlias[];
}

export async function fetchCountryMapping(signal?: AbortSignal): Promise<CountryMapping[]> {
  const url = '/resource/country';
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('Error fetching country mapping');
  }
  return (await res.json()) as CountryMapping[];
}

export async function fetchReferenceGenomeInfo(signal?: AbortSignal): Promise<ReferenceGenomeInfo> {
  const url = '/resource/reference-genome';
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('Error fetching reference genome information');
  }
  return (await res.json()) as ReferenceGenomeInfo;
}
