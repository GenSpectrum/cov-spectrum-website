import { LocationDateVariantSelector } from './LocationDateVariantSelector';
import { LapisInformation, LapisResponse } from './LapisResponse';
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
import { OrderAndLimitConfig } from './OrderAndLimitConfig';
import { addSamplingStrategyToUrlSearchParams } from './SamplingStrategy';
import { DatelessCountrylessCountSampleEntry } from './sample/DatelessCountrylessCountSampleEntry';
import { HospDiedAgeSampleEntry } from './sample/HospDiedAgeSampleEntry';

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

export async function fetchDatelessCountrylessCountSamples(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<DatelessCountrylessCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['division', 'age', 'sex', 'hospitalized', 'died'], signal);
}

export async function fetchHospDiedAgeSamples(
  selector: LocationDateVariantSelector,
  signal?: AbortSignal
): Promise<HospDiedAgeSampleEntry[]> {
  return _fetchAggSamples(selector, ['age', 'hospitalized', 'died'], signal);
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
  const url = await getLinkTo(
    `${sequenceType}-mutations`,
    selector,
    undefined,
    undefined,
    undefined,
    true,
    '0.001'
  );
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('Error fetching new samples data');
  }
  const body = (await res.json()) as LapisResponse<MutationProportionEntry[]>;
  return _extractLapisData(body);
}

export async function getLinkToStrainNames(
  selector: LocationDateVariantSelector,
  orderAndLimit?: OrderAndLimitConfig
): Promise<string> {
  return getLinkTo('strain-names', selector, orderAndLimit);
}

export async function getLinkToGisaidEpiIsl(
  selector: LocationDateVariantSelector,
  orderAndLimit?: OrderAndLimitConfig
): Promise<string> {
  return getLinkTo('gisaid-epi-isl', selector, orderAndLimit);
}

export async function getCsvLinkToContributors(selector: LocationDateVariantSelector): Promise<string> {
  return getLinkTo('contributors', selector, undefined, true, 'csv');
}

export async function getCsvLinkToDetails(selector: LocationDateVariantSelector): Promise<string> {
  return getLinkTo('details', selector, undefined, true, 'csv');
}

export async function getLinkToFasta(
  aligned: boolean,
  selector: LocationDateVariantSelector,
  orderAndLimit?: OrderAndLimitConfig
): Promise<string> {
  return getLinkTo(aligned ? 'fasta-aligned' : 'fasta', selector, orderAndLimit, true);
}

export async function getLinkTo(
  endpoint: string,
  selector: LocationDateVariantSelector,
  orderAndLimit?: OrderAndLimitConfig,
  downloadAsFile?: boolean,
  dataFormat?: string,
  omitHost = false,
  minProportion?: string
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
  if (selector.samplingStrategy) {
    addSamplingStrategyToUrlSearchParams(selector.samplingStrategy, params);
  }
  if (downloadAsFile) {
    params.set('downloadAsFile', 'true');
  }
  if (dataFormat) {
    params.set('dataFormat', 'csv');
  }
  if (minProportion) {
    params.set('minProportion', minProportion);
  }
  if (omitHost) {
    return `/sample/${endpoint}?${params.toString()}`;
  } else {
    return `${HOST}/sample/${endpoint}?${params.toString()}`;
  }
}

export async function _fetchAggSamples(
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
  if (selector.samplingStrategy) {
    addSamplingStrategyToUrlSearchParams(selector.samplingStrategy, params);
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
