import { CladenessMrca } from './cladeness-types';

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

export async function fetchMrca(ids: string[], signal?: AbortSignal): Promise<CladenessMrca> {
  const url = '/mrca';
  const res = await post(url, ids, signal);
  if (!res.ok) {
    throw new Error('Error fetching data');
  }
  const body = await res.json();
  return body as CladenessMrca;
}
