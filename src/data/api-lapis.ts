import { LapisInformation, LapisResponse } from './LapisResponse';
import { DateCountSampleEntry } from './sample/DateCountSampleEntry';
import { AgeCountSampleEntry } from './sample/AgeCountSampleEntry';
import { DivisionCountSampleEntry } from './sample/DivisionCountSampleEntry';
import { addLocationSelectorToUrlSearchParams, LocationSelector } from './LocationSelector';
import {
  addDateRangeSelectorToUrlSearchParams,
  addSubmittedDateRangeSelectorToUrlParams,
} from './DateRangeSelector';
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
import { InsertionCountEntry } from './InsertionCountEntry';
import { NextcladeDatasetInfo } from './NextcladeDatasetInfo';
import { mapFilterToLapisV2 } from './api-lapis-v2';
import { addVariantSelectorToUrlSearchParamsForApi } from './VariantSelector';
import { MRCAResponse } from './phylo/MRCAResponse';
import {
  MutationsOverTimeDateRange,
  MutationsOverTimeResponse,
} from './MutationsOverTimeResponse';

const HOST = process.env.REACT_APP_LAPIS_HOST;
const ACCESS_KEY = process.env.REACT_APP_LAPIS_ACCESS_KEY;

let currentLapisDataVersion: number | undefined = undefined;

const getRaw = async (
  endpoint: string,
  signal?: AbortSignal,
  options: { skipMaintenanceCheck?: boolean } = {}
) => {
  let url = `${HOST}/sample${endpoint}`;

  const requestInit =
    signal === undefined
      ? {
          method: 'GET',
        }
      : {
          method: 'GET',
          signal: signal,
        };

  const response = await fetch(url, requestInit);
  if (!(options.skipMaintenanceCheck === true) && response.status === 503) {
    window.location.reload();
  }
  return response;
};

// NOTE: Unlike getRaw, this does NOT add '/sample' to the path.
// The caller is responsible for providing the full endpoint path.
// TODO: Harmonize with getRaw in the future.
const postRaw = async (
  endpoint: string,
  body: unknown,
  signal?: AbortSignal,
  options: { skipMaintenanceCheck?: boolean } = {}
) => {
  let url = `${HOST}${endpoint}`;

  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  if (signal !== undefined) {
    requestInit.signal = signal;
  }

  const response = await fetch(url, requestInit);
  if (!(options.skipMaintenanceCheck === true) && response.status === 503) {
    window.location.reload();
  }
  return response;
};

const get = async (
  endpoint: string,
  signal?: AbortSignal,
  options: { skipMaintenanceCheck?: boolean } = {}
) => {
  const response = await getRaw(endpoint, signal, options);
  if (!response.ok) {
    if (response.body !== null) {
      let body;
      try {
        body = await response.json();
      } catch (e) {
        throw new Error(`Failed to fetch data from LAPIS: ${response.status}`);
      }
      if (body.error?.detail !== undefined) {
        throw new Error(`Failed to fetch data from LAPIS: ${body.error?.detail}`);
      }
    }

    throw new Error(`Failed to fetch data from LAPIS: ${response.status}`);
  }
  return response;
};

const post = async (
  endpoint: string,
  body: unknown,
  signal?: AbortSignal,
  options: { skipMaintenanceCheck?: boolean } = {}
) => {
  const response = await postRaw(endpoint, body, signal, options);
  if (!response.ok) {
    if (response.body !== null) {
      let responseBody;
      try {
        responseBody = await response.json();
      } catch (e) {
        throw new Error(`Failed to fetch data from LAPIS: ${response.status}`);
      }
      if (responseBody.error?.detail !== undefined) {
        throw new Error(`Failed to fetch data from LAPIS: ${responseBody.error?.detail}`);
      }
    }

    throw new Error(`Failed to fetch data from LAPIS: ${response.status}`);
  }
  return response;
};

export type SiloAvailability =
  | { isAvailable: true }
  | { isAvailable: false; retryAfterInSeconds: number | null };

export async function checkSiloAvailability(signal?: AbortSignal): Promise<SiloAvailability> {
  let url = '/aggregated';
  if (ACCESS_KEY) {
    url += '?accessKey=' + (await _getCurrentAccessKey());
  }
  const response = await getRaw(url, signal, { skipMaintenanceCheck: true });

  if (response.status !== 503) {
    return { isAvailable: true as const };
  }

  const retryAfterInSeconds = response.headers.get('Retry-After');
  if (retryAfterInSeconds === null) {
    return { isAvailable: false, retryAfterInSeconds: null };
  }
  return { isAvailable: false, retryAfterInSeconds: Number(retryAfterInSeconds) };
}

export async function fetchLapisDataVersion(signal?: AbortSignal): Promise<number> {
  let url = '/info';
  if (ACCESS_KEY) {
    url += '?accessKey=' + (await _getCurrentAccessKey());
  }
  const response = await get(url, signal, { skipMaintenanceCheck: true });
  if (!response.ok) {
    throw new Error('Error fetching info');
  }
  const info = (await response.json()) as LapisInformation;
  return Number(info.dataVersion);
}

export async function fetchNextcladeDatasetInfo(signal?: AbortSignal): Promise<NextcladeDatasetInfo> {
  let url = '/aggregated?fields=nextcladeDatasetVersion';
  if (ACCESS_KEY) {
    url += '&accessKey=' + (await _getCurrentAccessKey());
  }
  const response = await get(url, signal, { skipMaintenanceCheck: true });
  const nexcladeDatasetInfo = (await response.json()) as LapisResponse<{ nextcladeDatasetVersion: string }[]>;
  return {
    name: 'nextclade-dataset',
    tag: nexcladeDatasetInfo.data[0].nextcladeDatasetVersion,
  };
}

export async function fetchAllHosts(): Promise<string[]> {
  let url = '/aggregated?fields=host';
  if (ACCESS_KEY) {
    url += '&accessKey=' + (await _getCurrentAccessKey());
  }
  const res = await get(url, undefined, { skipMaintenanceCheck: true });
  const body = (await res.json()) as LapisResponse<{ host: string; count: number }[]>;

  return _extractLapisData(body)
    .map(entry => entry.host)
    .map(host => (host === null ? 'Unknown' : host));
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
    getMutationEndpoint(sequenceType),
    selector,
    undefined,
    undefined,
    undefined,
    true,
    minProportion.toString()
  );
  const res = await get(url, signal);
  const body = (await res.json()) as LapisResponse<MutationProportionEntry[]>;
  return _extractLapisData(body);
}

function getMutationEndpoint(sequenceType: SequenceType): string {
  switch (sequenceType) {
    case 'nuc':
      return 'nucleotideMutations';
    case 'aa':
      return 'aminoAcidMutations';
    default:
      throw new Error(`Unknown mutation type: ${sequenceType}`);
  }
}

export async function fetchInsertionCounts(
  selector: LapisSelector,
  sequenceType: SequenceType,
  signal?: AbortSignal
): Promise<InsertionCountEntry[]> {
  const url = await getLinkTo(
    getInsertionEndpoint(sequenceType),
    selector,
    undefined,
    undefined,
    undefined,
    true
  );
  const res = await get(url, signal);
  const body = (await res.json()) as LapisResponse<InsertionCountEntry[]>;
  return _extractLapisData(body);
}

function getInsertionEndpoint(sequenceType: SequenceType): string {
  switch (sequenceType) {
    case 'nuc':
      return 'nucleotideInsertions';
    case 'aa':
      return 'aminoAcidInsertions';
    default:
      throw new Error(`Unknown mutation type: ${sequenceType}`);
  }
}

export async function fetchMutationsOverTime(
  selector: LapisSelector,
  sequenceType: SequenceType,
  mutations: string[],
  dateRanges: MutationsOverTimeDateRange[],
  dateField: string,
  signal?: AbortSignal
): Promise<MutationsOverTimeResponse> {
  const endpoint = getMutationsOverTimeEndpoint(sequenceType);

  // Build the request body
  const requestBody = {
    filters: {
      // TODO: Convert LapisSelector to filters object
      // The selector contains location, dateRange, variant, samplingStrategy, host, submissionDate, qc
      // These need to be mapped to the LAPIS filters format
      // For reference, see how getLinkTo() uses:
      // - addLocationSelectorToUrlSearchParams(selector.location, params)
      // - addDateRangeSelectorToUrlSearchParams(selector.dateRange, params)
      // - addVariantSelectorToUrlSearchParamsForApi(selector.variant, params)
      // - addSamplingStrategyToUrlSearchParams(selector.samplingStrategy, params)
      // - addHostSelectorToUrlSearchParams(selector.host, params)
      // - addSubmittedDateRangeSelectorToUrlParams(params, selector.submissionDate, true)
      // - addQcSelectorToUrlSearchParams(selector.qc, params)
    },
    includeMutations: mutations,
    dateRanges: dateRanges,
    dateField: dateField,
  };

  // Add accessKey if available
  let endpointWithParams = `/${endpoint}`;
  if (ACCESS_KEY) {
    endpointWithParams += `?accessKey=${ACCESS_KEY}`;
  }

  const res = await post(endpointWithParams, requestBody, signal);
  const body = (await res.json()) as LapisResponse<MutationsOverTimeResponse>;
  return _extractLapisData(body);
}

function getMutationsOverTimeEndpoint(sequenceType: SequenceType): string {
  switch (sequenceType) {
    case 'nuc':
      return 'component/nucleotideMutationsOverTime';
    case 'aa':
      return 'component/aminoAcidMutationsOverTime';
    default:
      throw new Error(`Unknown mutation type: ${sequenceType}`);
  }
}

export async function fetchDetails<Fields extends readonly string[]>(
  selector: LapisSelector,
  fields: Fields,
  signal?: AbortSignal
): Promise<Array<{ [K in Fields[number]]: any }>> {
  let url = await getLinkTo('details', selector, undefined, undefined, undefined, true);
  const additionalParams = new URLSearchParams({
    fields: fields.join(','),
  });
  url += '&' + additionalParams.toString();

  const res = await get(url, signal);
  const body = (await res.json()) as LapisResponse<
    Array<{ usherTree: string } & { [K in Fields[number]]: any }>
  >;

  return _extractLapisData(body);
}

export async function fetchMRCA(selector: LapisSelector, signal?: AbortSignal): Promise<MRCAResponse> {
  let url = await getLinkTo('mostRecentCommonAncestor', selector, undefined, undefined, undefined, true);
  const additionalParams = new URLSearchParams({
    phyloTreeField: 'usherTree',
  });
  url += '&' + additionalParams.toString();

  const res = await get(url, signal);
  const body = (await res.json()) as LapisResponse<MRCAResponse[]>;
  return _extractLapisData(body)[0];
}

export async function fetchNewickTree(selector: LapisSelector, signal?: AbortSignal): Promise<string> {
  let url = await getLinkTo('phyloSubtree', selector, undefined, undefined, undefined, true);
  const additionalParams = new URLSearchParams({
    phyloTreeField: 'usherTree',
  });
  url += '&' + additionalParams.toString();

  const res = await get(url, signal);
  return await res.text();
}

export async function getLinkToListOfPrimaryKeys(
  primaryKey: string,
  selector: LapisSelector,
  orderAndLimit?: OrderAndLimitConfig
): Promise<string> {
  const dataFormat = 'CSV-WITHOUT-HEADERS';

  const linkToDetails = new URL(await getLinkTo('details', selector, orderAndLimit, true, dataFormat));
  linkToDetails.searchParams.set('fields', primaryKey);

  return linkToDetails.toString();
}

export async function getCsvLinkToDetails(selector: LapisSelector): Promise<string> {
  return getLinkTo('details', selector, undefined, true, 'csv');
}

export async function getLinkToFasta(
  aligned: boolean,
  selector: LapisSelector,
  orderAndLimit?: OrderAndLimitConfig
): Promise<string> {
  return getLinkTo(
    aligned ? 'alignedNucleotideSequences' : 'unalignedNucleotideSequences',
    selector,
    orderAndLimit,
    true
  );
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
  const params = new URLSearchParams();
  _addOrderAndLimitToSearchParams(params, orderAndLimit);
  selector = await _mapCountryName(selector);
  addLocationSelectorToUrlSearchParams(selector.location, params);
  if (selector.dateRange) {
    addDateRangeSelectorToUrlSearchParams(selector.dateRange, params);
  }
  if (selector.variant) {
    addVariantSelectorToUrlSearchParamsForApi(selector.variant, params);
  }
  if (selector.samplingStrategy) {
    addSamplingStrategyToUrlSearchParams(selector.samplingStrategy, params);
  }
  if (selector.host) {
    addHostSelectorToUrlSearchParams(selector.host, params);
  }
  if (selector.submissionDate) {
    addSubmittedDateRangeSelectorToUrlParams(params, selector.submissionDate, true);
  }

  addQcSelectorToUrlSearchParams(selector.qc, params);

  if (downloadAsFile) {
    params.set('downloadAsFile', 'true');
  }
  if (dataFormat) {
    params.set('dataFormat', dataFormat);
  }
  if (minProportion) {
    params.set('minProportion', minProportion);
  }
  if (ACCESS_KEY) {
    params.set('accessKey', await _getCurrentAccessKey());
  }
  if (omitHost) {
    return `/${endpoint}?${params.toString()}`;
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
  _additionalParams.set('fields', fields.map(mapFilterToLapisV2).join(','));
  const response = await get(`${linkPrefix}&${_additionalParams}`, signal);
  const body = (await response.json()) as LapisResponse<FullSampleAggEntryRaw[]>;

  const parsed = _extractLapisData(body).map(raw => parseFullSampleAggEntry(raw));
  if (fields.includes('country')) {
    const gisaidToCovSpectrumNameMap = await LocationService.getGisaidToCovSpectrumNameMap();
    return parsed.map(e => ({
      ...e,
      country: e.country ? (gisaidToCovSpectrumNameMap.get(e.country) ?? null) : null,
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
  if (currentLapisDataVersion === undefined) {
    currentLapisDataVersion = Number(response.info.dataVersion);
  } else if (currentLapisDataVersion !== Number(response.info.dataVersion)) {
    console.log(
      `LAPIS has new data. Old version: ${currentLapisDataVersion}, new version: ${response.info.dataVersion}. ` +
        `The website will be reloaded.`
    );

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

async function _getCurrentAccessKey(): Promise<string> {
  const currentKeyRaw = `${ACCESS_KEY}:${Math.floor(Date.now() / 1000)}`;
  const data = new TextEncoder().encode(currentKeyRaw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
