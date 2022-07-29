import { CladenessClustersResponse, CladenessMrcaResponse } from './cladeness-types';
import { DateRange } from './DateRange';

const HOST = 'https://cladeness.cov-spectrum.org';

const getBaseHeaders = (): Headers => {
  const headers: { [key: string]: string } = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  return new Headers(headers);
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

export async function fetchMrca(ids: string[], signal?: AbortSignal): Promise<CladenessMrcaResponse> {
  const url = '/mrca';
  const res = await post(url, ids, signal);
  if (!res.ok) {
    throw new Error('Error fetching data');
  }
  const body = await res.json();
  return body as CladenessMrcaResponse;
}

export async function fetchClusters(
  ids: string[],
  selector: {
    region?: string;
    country?: string;
    dateRange?: DateRange;
  },
  signal?: AbortSignal
): Promise<CladenessClustersResponse> {
  const url = '/clusters';
  const res = await post(
    url,
    {
      ids,
      min_rel_size: 0.01,
      n_clusters: 8,
      region: selector.region,
      country: selector.country,
      date_from: selector.dateRange?.dateFrom?.string,
      date_to: selector.dateRange?.dateTo?.string,
    },
    signal
  );
  if (!res.ok) {
    throw new Error('Error fetching data');
  }
  const body = await res.json();
  return body as CladenessClustersResponse;
}
