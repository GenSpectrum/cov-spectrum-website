import { LapisInformation, LapisResponse } from './LapisResponse';
import { DateCountSampleEntry } from './sample/DateCountSampleEntry';
import { AgeCountSampleEntry } from './sample/AgeCountSampleEntry';
import { DivisionCountSampleEntry } from './sample/DivisionCountSampleEntry';
import { addLocationSelectorToUrlSearchParams, LocationSelector } from './LocationSelector';
import {
  addSubmittedDateRangeRawSelectorToUrlSearchParams,
  addDateRangeSelectorToUrlSearchParams,
} from './DateRangeSelector';
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
import { OrderAndLimitConfig } from './OrderAndLimitConfig';
import { addSamplingStrategyToUrlSearchParams } from './SamplingStrategy';
import { DatelessCountrylessCountSampleEntry } from './sample/DatelessCountrylessCountSampleEntry';
import { HospDiedAgeSampleEntry } from './sample/HospDiedAgeSampleEntry';
import { LapisSelector } from './LapisSelector';
import { addHostSelectorToUrlSearchParams } from './HostSelector';
import { addQcSelectorToUrlSearchParams } from './QcSelector';
import { HostCountSampleEntry } from './sample/HostCountSampleEntry';
import { sequenceDataSource } from '../helpers/sequence-data-source';
import { InsertionCountEntry } from './InsertionCountEntry';

const HOST = process.env.REACT_APP_LAPIS_HOST;
const ACCESS_KEY = process.env.REACT_APP_LAPIS_ACCESS_KEY;

export const HUMAN = sequenceDataSource === 'gisaid' ? 'Human' : 'Homo sapiens';

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
  let url = '/sample/info';
  if (ACCESS_KEY) {
    url += '?accessKey=' + ACCESS_KEY;
  }
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('Error fetching info');
  }
  const info = (await res.json()) as LapisInformation;
  currentLapisDataVersion = info.dataVersion;
}

export function getCurrentLapisDataVersionDate(): Date | undefined {
  return currentLapisDataVersion !== undefined ? dayjs.unix(currentLapisDataVersion).toDate() : undefined;
}

export async function fetchAllHosts(): Promise<string[]> {
  let url = '/sample/aggregated?fields=host';
  if (ACCESS_KEY) {
    url += '&accessKey=' + ACCESS_KEY;
  }
  const res = await get(url);
  if (!res.ok) {
    throw new Error('Error fetching new samples data');
  }
  const body = (await res.json()) as LapisResponse<{ host: string; count: number }[]>;
  return _extractLapisData(body).map(e => e.host);
}

export async function fetchDateCountSamples(
  selector: LapisSelector,
  signal?: AbortSignal
): Promise<DateCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['date'], signal);
}

export async function fetchAgeCountSamples(
  selector: LapisSelector,
  signal?: AbortSignal
): Promise<AgeCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['age'], signal);
}

export async function fetchDivisionCountSamples(
  selector: LapisSelector,
  signal?: AbortSignal
): Promise<DivisionCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['division', 'country', 'region'], signal);
}

export async function fetchCountryDateCountSamples(
  selector: LapisSelector,
  signal?: AbortSignal
): Promise<CountryDateCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['date', 'country'], signal);
}

export async function fetchDatelessCountrylessCountSamples(
  selector: LapisSelector,
  signal?: AbortSignal
): Promise<DatelessCountrylessCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['division', 'age', 'sex', 'hospitalized', 'died'], signal);
}

export async function fetchHospDiedAgeSamples(
  selector: LapisSelector,
  signal?: AbortSignal
): Promise<HospDiedAgeSampleEntry[]> {
  return _fetchAggSamples(selector, ['age', 'hospitalized', 'died'], signal);
}

export async function fetchSamplesCount(selector: LapisSelector, signal?: AbortSignal): Promise<number> {
  return _fetchAggSamples(selector, [], signal).then(entries => entries[0].count);
}

export async function fetchPangoLineageCountSamples(
  selector: LapisSelector,
  signal?: AbortSignal
): Promise<PangoCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['pangoLineage'], signal);
}

export async function fetchHostCountSamples(
  selector: LapisSelector,
  signal?: AbortSignal
): Promise<HostCountSampleEntry[]> {
  return _fetchAggSamples(selector, ['host'], signal);
}

export async function fetchNumberSubmittedSamplesInPastTenDays(
  selector: LapisSelector,
  signal?: AbortSignal
): Promise<number> {
  const additionalParams = new URLSearchParams();
  additionalParams.set('dateSubmittedFrom', dayjs().subtract(10, 'days').toISOString().substring(0, 10));
  const res = await _fetchAggSamples(selector, [], signal, additionalParams);
  return res[0].count;
}

export async function fetchMutationProportions(
  selector: LapisSelector,
  sequenceType: SequenceType,
  signal?: AbortSignal,
  minProportion = 0.001
): Promise<MutationProportionEntry[]> {
  const url = await getLinkTo(
    `${sequenceType}-mutations`,
    selector,
    undefined,
    undefined,
    undefined,
    true,
    minProportion.toString()
  );
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('Error fetching new samples data');
  }
  const body = (await res.json()) as LapisResponse<MutationProportionEntry[]>;
  return _extractLapisData(body);
}

export async function fetchInsertionCounts(
  selector: LapisSelector,
  sequenceType: SequenceType,
  signal?: AbortSignal
): Promise<InsertionCountEntry[]> {
  const url = await getLinkTo(`${sequenceType}-insertions`, selector, undefined, undefined, undefined, true);
  const res = await get(url, signal);
  if (!res.ok) {
    throw new Error('Error fetching new samples data');
  }
  const body = (await res.json()) as LapisResponse<InsertionCountEntry[]>;
  return _extractLapisData(body);
}

export async function getLinkToStrainNames(
  selector: LapisSelector,
  orderAndLimit?: OrderAndLimitConfig
): Promise<string> {
  return getLinkTo('strain-names', selector, orderAndLimit);
}

export async function getLinkToGisaidEpiIsl(
  selector: LapisSelector,
  orderAndLimit?: OrderAndLimitConfig
): Promise<string> {
  return getLinkTo('gisaid-epi-isl', selector, orderAndLimit);
}

export async function getCsvLinkToContributors(selector: LapisSelector): Promise<string> {
  return getLinkTo('contributors', selector, undefined, true, 'csv');
}

export async function getCsvLinkToDetails(selector: LapisSelector): Promise<string> {
  return getLinkTo('details', selector, undefined, true, 'csv');
}

export async function getLinkToFasta(
  aligned: boolean,
  selector: LapisSelector,
  orderAndLimit?: OrderAndLimitConfig
): Promise<string> {
  return getLinkTo(aligned ? 'fasta-aligned' : 'fasta', selector, orderAndLimit, true);
}

export async function getLinkTo(
  endpoint: string,
  selector: LapisSelector,
  orderAndLimit?: OrderAndLimitConfig,
  downloadAsFile?: boolean,
  dataFormat?: string,
  omitHost = false,
  minProportion?: string
): Promise<string> {
  console.log('GET LINK TO', endpoint, selector);
  const params = new URLSearchParams();
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
  if (selector.host) {
    addHostSelectorToUrlSearchParams(selector.host, params);
  }

  if (selector.dateSubmitted) {
    addSubmittedDateRangeRawSelectorToUrlSearchParams(selector.dateSubmitted, params);
  }
  addQcSelectorToUrlSearchParams(selector.qc, params);
  if (downloadAsFile) {
    params.set('downloadAsFile', 'true');
  }
  if (dataFormat) {
    params.set('dataFormat', 'csv');
  }
  if (minProportion) {
    params.set('minProportion', minProportion);
  }
  if (ACCESS_KEY) {
    params.set('accessKey', ACCESS_KEY);
  }
  if (omitHost) {
    return `/sample/${endpoint}?${params.toString()}`;
  } else {
    return `${HOST}/sample/${endpoint}?${params.toString()}`;
  }
}

export async function _fetchAggSamples(
  selector: LapisSelector,
  fields: string[],
  signal?: AbortSignal,
  additionalParams?: URLSearchParams
): Promise<FullSampleAggEntry[]> {
  const linkPrefix = await getLinkTo('aggregated', selector, undefined, undefined, undefined, true);
  const _additionalParams = new URLSearchParams(additionalParams);
  _additionalParams.set('fields', fields.join(','));
  const res = await get(`${linkPrefix}&${_additionalParams}`, signal);
  if (!res.ok) {
    if (res.body !== null) {
      const errors = (await res.json()).errors as { message: string }[];
      if (errors.length > 0) {
        throw new Error(errors.map(e => e.message).join(' '));
      }
    }
    throw new Error();
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
