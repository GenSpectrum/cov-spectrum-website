import { LocationDateVariantSelector } from './LocationDateVariantSelector';
import { LapisInformation, LapisResponse } from './LapisResponse';
import { DetailedSampleAggEntry } from './sample/DetailedSampleAggEntry';
import { DateCountSampleEntry } from './sample/DateCountSampleEntry';
import { AgeCountSampleEntry } from './sample/AgeCountSampleEntry';
import { DivisionCountSampleEntry } from './sample/DivisionCountSampleEntry';
import { addLocationSelectorToUrlSearchParams, LocationSelector } from './LocationSelector';
import { addDateRangeSelectorToUrlSearchParams } from './DateRangeSelector';
import { addVariantSelectorToUrlSearchParams } from './VariantSelector';
import { CountryDateCountSampleEntry } from './sample/CountryDateCountSampleEntry';
import { PangoCountSampleEntry } from './sample/PangoCountSampleEntry';
import {
  FullSampleAggEntry,
  FullSampleAggEntryRaw,
  parseFullSampleAggEntry,
} from './sample/FullSampleAggEntry';
import { SequenceType } from './SequenceType';
import { MutationProportionEntry } from './MutationProportionEntry';
import dayjs from 'dayjs';
import { LocationService } from '../services/LocationService';
import { sequenceDataSource } from '../helpers/sequence-data-source';
import { ContributorsEntry } from './ContributorsEntry';
import { parseSampleDetailsEntry, SampleDetailsEntry, SampleDetailsEntryRaw } from './SampleDetailsEntry';
import { OrderAndLimitConfig } from './OrderAndLimitConfig';

const HOST = process.env.REACT_APP_LAPIS_HOST;

let currentLapisDataVersion: number | undefined = undefined;

export const get = async (endpoint: string, signal?: AbortSignal) => {
  let url = HOST + endpoint;
  if (currentLapisDataVersion !== undefined) {
    url += '&dataVersion=' + currentLapisDataVersion;
  }
  const res = await fetch(url, {
    method: 'GET',
    signal,
  });
  if (res.status === 410) {
    window.location.reload();
  }
  return res;
};

export async function fetchLapisDataVersionDate(signal?: AbortSignal) {
  const res = await get('/sample/info', signal);
  if (!res.ok) {
    throw new Error('Error fetching info');
  }
  const info = (await res.json()) as LapisInformation;
  currentLapisDataVersion = info.dataVersion;
}

export function getCurrentLapisDataVersionDate(): Date | undefined {
  return currentLapisDataVersion !== undefined ? dayjs.unix(currentLapisDataVersion).toDate() : undefined;
}

export async function fetchDetailedSamples(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<DetailedSampleAggEntry[]> {
  return _fetchAggSamples(
    selector,
    ['date', 'region', 'country', 'division', 'age', 'sex', 'hospitalized', 'died', 'fullyVaccinated'],
    signal
  );
}

export async function fetchDateCountSamples(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<DateCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['date'], signal);
}

export async function fetchAgeCountSamples(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<AgeCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['age'], signal);
}

export async function fetchDivisionCountSamples(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<DivisionCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['division'], signal);
}

export async function fetchCountryDateCountSamples(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<CountryDateCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['date', 'country'], signal);
}

export async function fetchSamplesCount(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<number> {
  return _fetchAggSamples(selector, [], signal).then(entries => entries[0].count);
}

export async function fetchPangoLineageCountSamples(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<PangoCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['pangoLineage'], signal);
}

export async function fetchMutationProportions(
  selector: LocationDateVariantSelector,
  sequenceType: SequenceType,
  signal?: AbortSignal
): Promise<MutationProportionEntry[]> {
  const params = new URLSearchParams();
  _addDefaultsToSearchParams(params);
  selector = await _mapCountryName(selector);
  addLocationSelectorToUrlSearchParams(selector.location, params);
  if (selector.dateRange) {
    addDateRangeSelectorToUrlSearchParams(selector.dateRange, params);
  }
  if (selector.variant) {
    addVariantSelectorToUrlSearchParams(selector.variant, params);
  }

  const res = await get(`/sample/${sequenceType}-mutations?${params.toString()}`, signal);
  if (!res.ok) {
    throw new Error('Error fetching new samples data');
  }
  const body = (await res.json()) as LapisResponse<MutationProportionEntry[]>;
  return _extractLapisData(body);
}

export async function fetchSampleDetails(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<SampleDetailsEntry[]> {
  const params = new URLSearchParams();
  _addDefaultsToSearchParams(params);
  selector = await _mapCountryName(selector);
  addLocationSelectorToUrlSearchParams(selector.location, params);
  if (selector.dateRange) {
    addDateRangeSelectorToUrlSearchParams(selector.dateRange, params);
  }
  if (selector.variant) {
    addVariantSelectorToUrlSearchParams(selector.variant, params);
  }

  const res = await get(`/sample/details?${params.toString()}`, signal);
  if (!res.ok) {
    throw new Error('Error fetching contributors data');
  }
  const body = (await res.json()) as LapisResponse<SampleDetailsEntryRaw[]>;
  return _extractLapisData(body).map(parseSampleDetailsEntry);
}

export async function fetchContributors(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<ContributorsEntry[]> {
  const params = new URLSearchParams();
  _addDefaultsToSearchParams(params);
  selector = await _mapCountryName(selector);
  addLocationSelectorToUrlSearchParams(selector.location, params);
  if (selector.dateRange) {
    addDateRangeSelectorToUrlSearchParams(selector.dateRange, params);
  }
  if (selector.variant) {
    addVariantSelectorToUrlSearchParams(selector.variant, params);
  }

  const res = await get(`/sample/contributors?${params.toString()}`, signal);
  if (!res.ok) {
    throw new Error('Error fetching contributors data');
  }
  const body = (await res.json()) as LapisResponse<ContributorsEntry[]>;
  return _extractLapisData(body);
}

export async function getLinkToStrainNames(
  selector: LocationDateVariantSelector,
  orderAndLimit?: OrderAndLimitConfig
): Promise<string> {
  const params = new URLSearchParams();
  _addDefaultsToSearchParams(params);
  _addOrderAndLimitToSearchParams(params, orderAndLimit);
  selector = await _mapCountryName(selector);
  addLocationSelectorToUrlSearchParams(selector.location, params);
  if (selector.dateRange) {
    addDateRangeSelectorToUrlSearchParams(selector.dateRange, params);
  }
  if (selector.variant) {
    addVariantSelectorToUrlSearchParams(selector.variant, params);
  }
  return `${HOST}/sample/strain-names?${params.toString()}`;
}

export async function getLinkToGisaidEpiIsl(
  selector: LocationDateVariantSelector,
  orderAndLimit?: OrderAndLimitConfig
): Promise<string> {
  const params = new URLSearchParams();
  _addDefaultsToSearchParams(params);
  _addOrderAndLimitToSearchParams(params, orderAndLimit);
  selector = await _mapCountryName(selector);
  addLocationSelectorToUrlSearchParams(selector.location, params);
  if (selector.dateRange) {
    addDateRangeSelectorToUrlSearchParams(selector.dateRange, params);
  }
  if (selector.variant) {
    addVariantSelectorToUrlSearchParams(selector.variant, params);
  }
  return `${HOST}/sample/gisaid-epi-isl?${params.toString()}`;
}

async function _fetchAggSamples(
  selector: LocationDateVariantSelector,
  fields: string[],
  signal?: AbortSignal
): Promise<FullSampleAggEntry[]> {
  const params = new URLSearchParams();
  params.set('fields', fields.join(','));
  _addDefaultsToSearchParams(params);
  selector = await _mapCountryName(selector);
  addLocationSelectorToUrlSearchParams(selector.location, params);
  if (selector.dateRange) {
    addDateRangeSelectorToUrlSearchParams(selector.dateRange, params);
  }
  if (selector.variant) {
    addVariantSelectorToUrlSearchParams(selector.variant, params);
  }

  const res = await get(`/sample/aggregated?${params.toString()}`, signal);
  if (!res.ok) {
    throw new Error('Error fetching new samples data');
  }
  const body = (await res.json()) as LapisResponse<FullSampleAggEntryRaw[]>;
  const parsed = _extractLapisData(body).map(raw => parseFullSampleAggEntry(raw));
  if (fields.includes('country')) {
    const gisaidToCovSpectrumNameMap = await LocationService.getGisaidToCovSpectrumNameMap();
    return parsed.map(e => ({
      ...e,
      country: e.country ? gisaidToCovSpectrumNameMap.get(e.country) ?? null : null,
    }));
  }
  return parsed;
}

function _addDefaultsToSearchParams(params: URLSearchParams) {
  params.set('host', sequenceDataSource === 'gisaid' ? 'Human' : 'Homo sapiens');
}

function _addOrderAndLimitToSearchParams(params: URLSearchParams, orderAndLimitConfig?: OrderAndLimitConfig) {
  if (orderAndLimitConfig) {
    const { orderBy, limit } = orderAndLimitConfig;
    if (orderBy) {
      params.set('orderBy', orderBy);
    }
    if (limit) {
      params.set('limit', limit.toString());
    }
  }
}

function _extractLapisData<T>(response: LapisResponse<T>): T {
  if (response.errors.length > 0) {
    throw new Error('LAPIS returned an error: ' + JSON.stringify(response.errors));
  }
  if (currentLapisDataVersion === undefined) {
    currentLapisDataVersion = response.info.dataVersion;
  } else if (currentLapisDataVersion !== response.info.dataVersion) {
    // Refresh the website if there are new data
    window.location.reload();
    throw new Error(
      `LAPIS has new data. Old version: ${currentLapisDataVersion}, new version: ${response.info.dataVersion}. ` +
        `The website will be reloaded.`
    );
  }
  return response.data;
}

async function _mapCountryName<T extends { location: LocationSelector }>(selector: T): Promise<T> {
  if (selector.location.country) {
    selector = {
      ...selector,
      location: {
        ...selector.location,
        country: await LocationService.getGisaidName(selector.location.country),
      },
    };
  }
  return selector;
}
