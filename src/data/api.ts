import { CaseCountEntry, CaseCountEntryRaw, parseCaseCountEntry } from './CaseCountEntry';
import { LocationDateSelector } from './LocationDateSelector';
import { addLocationSelectorToUrlSearchParams } from './LocationSelector';
import { addDateRangeSelectorToUrlSearchParams } from './DateRangeSelector';
import { PangoLineageAlias } from './PangoLineageAlias';
import { CountryMapping } from './CountryMapping';
import { AccountService } from '../services/AccountService';
import { ReferenceGenomeInfo } from './ReferenceGenomeInfo';
import { UserCountry } from './UserCountry';
import { AddCollectionResponse, Collection } from './Collection';
import { PangoLineageRecombinant } from './PangoLineageRecombinant';

export const HOST = process.env.REACT_APP_SERVER_HOST;

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

export const post = (endpoint: string, body: unknown, signal?: AbortSignal, stringifyBody = true) => {
  const url = HOST + endpoint;
  return fetch(url, {
    method: 'POST',
    headers: getBaseHeaders(),
    body: stringifyBody ? JSON.stringify(body) : (body as any),
    signal,
  });
};

export const put = (endpoint: string, body: unknown, signal?: AbortSignal, stringifyBody = true) => {
  const url = HOST + endpoint;
  return fetch(url, {
    method: 'PUT',
    headers: getBaseHeaders(),
    body: stringifyBody ? JSON.stringify(body) : (body as any),
    signal,
  });
};

export const del = (endpoint: string, signal?: AbortSignal) => {
  const url = HOST + endpoint;
  return fetch(url, {
    method: 'DELETE',
    headers: getBaseHeaders(),
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
  try {
    const res = await get(`/resource/case?${params.toString()}`, signal);
    if (!res.ok) {
      throw new Error('Error fetching new case data');
    }

    const body = (await res.json()) as CaseCountEntryRaw[];
    return body.map(raw => parseCaseCountEntry(raw));
  } catch (err) {
    console.error('fetchCaseCounts', err);
    throw new Error('Error fetching new case data');
  }
}

export async function fetchPangoLineageAliases(signal?: AbortSignal): Promise<PangoLineageAlias[]> {
  const url = '/resource/pango-lineage-alias';
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('Error fetching pango lineage aliases');
  }
  return (await res.json()) as PangoLineageAlias[];
}

export async function fetchPangoLineageRecombinant(signal?: AbortSignal): Promise<PangoLineageRecombinant[]> {
  const url = '/resource/pango-lineage-recombinant';
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('Error fetching pango lineage recombinants');
  }
  return (await res.json()) as PangoLineageRecombinant[];
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

export async function fetchCollection(id: number, signal?: AbortSignal): Promise<Collection | null> {
  const url = '/resource/collection/' + id;
  const res = await get(url, signal);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Error fetching collection');
  }
  return (await res.json()) as Collection;
}

export async function fetchCollections(signal?: AbortSignal): Promise<Collection[]> {
  const url = '/resource/collection';
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('Error fetching collection');
  }
  return (await res.json()) as Collection[];
}

export async function addCollection(collection: Collection): Promise<AddCollectionResponse> {
  const url = '/resource/collection';
  const res = await post(url, collection);
  if (!res.ok) {
    throw new Error('Error adding collection');
  }
  return (await res.json()) as AddCollectionResponse;
}

export async function updateCollection(collection: Collection, adminKey: string): Promise<void> {
  const url = `/resource/collection/${collection.id}?adminKey=${adminKey}`;
  const res = await put(url, collection);
  if (!res.ok) {
    throw new Error('Error updating collection');
  }
}

export async function deleteCollection(id: number, adminKey: string): Promise<void> {
  const url = `/resource/collection/${id}?adminKey=${adminKey}`;
  const res = await del(url);
  if (!res.ok) {
    throw new Error('Error updating collection');
  }
}

export async function validateCollectionAdminKey(id: number, adminKey: string): Promise<boolean> {
  const url = `/resource/collection/${id}/validate-admin-key`;
  const res = await post(url, adminKey, undefined, false);
  if (!res.ok) {
    throw new Error('Error validating admin key');
  }
  return (await res.json()) as boolean;
}
