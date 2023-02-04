import * as zod from 'zod';

export const LocationSelectorEncodedSchema = zod.object({
  region: zod.string().optional(),
  country: zod.string().optional(),
  division: zod.string().optional(),
});

export type LocationSelector = zod.infer<typeof LocationSelectorEncodedSchema>;

export const locationFields = ['region', 'country', 'division'] as const;
export type LocationField = (typeof locationFields)[number];

export function encodeLocationSelector(selector: LocationSelector): LocationSelector {
  return selector;
}

export function decodeLocationSelector(encoded: LocationSelector): LocationSelector {
  return encoded;
}

export function addLocationSelectorToUrlSearchParams(selector: LocationSelector, params: URLSearchParams) {
  for (const k of locationFields) {
    const value = selector[k];
    if (value !== undefined) {
      params.set(k, value);
    }
  }
}

export function removeLocationSelectorToUrlSearchParams(params: URLSearchParams) {
  for (const k of locationFields) {
    params.delete(k);
  }
}

export function getLocationSelectorFromUrlSearchParams(params: URLSearchParams): LocationSelector {
  return {
    region: params.get('region') ?? undefined,
    country: params.get('country') ?? undefined,
    division: params.get('division') ?? undefined,
  };
}

export function decodeLocationSelectorFromSingleString(encoded: string): LocationSelector {
  if (encoded === 'World') {
    return {};
  }
  const regions = ['Africa', 'Europe', 'Asia', 'North America', 'South America', 'Oceania'];
  if (regions.includes(encoded)) {
    return { region: encoded };
  }
  return { country: encoded };
}

export function encodeLocationSelectorToSingleString({
  region,
  country,
  division,
}: LocationSelector): string {
  if (division && !country) {
    throw new Error('Divisions are not unique and cannot encoded without a country.');
  }
  if (division) {
    return `${division}, ${country}`;
  }
  if (!region && !country) {
    return 'World';
  }
  if (region && !country) {
    return region;
  }
  if (country) {
    return country;
  }
  throw new Error('This line should be impossible to reach.');
}
