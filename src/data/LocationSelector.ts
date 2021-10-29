import * as zod from 'zod';

export const LocationSelectorEncodedSchema = zod.object({
  region: zod.string().optional(),
  country: zod.string().optional(),
  division: zod.string().optional(),
});

export type LocationSelector = zod.infer<typeof LocationSelectorEncodedSchema>;

export function encodeLocationSelector(selector: LocationSelector): LocationSelector {
  return selector;
}

export function decodeLocationSelector(encoded: LocationSelector): LocationSelector {
  return encoded;
}

export function addLocationSelectorToUrlSearchParams(selector: LocationSelector, params: URLSearchParams) {
  for (const k of ['region', 'country', 'division'] as const) {
    const value = selector[k];
    if (value !== undefined) {
      params.set(k, value);
    }
  }
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
  if (division) {
    throw new Error('There is no encoding for divisions.');
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
