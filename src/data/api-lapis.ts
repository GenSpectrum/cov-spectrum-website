import { LapisInformation, LapisResponse } from './LapisResponse';
import { DateCountSampleEntry } from './sample/DateCountSampleEntry';
import { AgeCountSampleEntry } from './sample/AgeCountSampleEntry';
import { DivisionCountSampleEntry } from './sample/DivisionCountSampleEntry';
import { addLocationSelectorToUrlSearchParams, LocationSelector } from './LocationSelector';
import {
  addDateRangeSelectorToUrlSearchParams,
  addSubmittedDateRangeSelectorToUrlParams,
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
import { InsertionCountEntry } from './InsertionCountEntry';
import { NextcladeDatasetInfo } from './NextcladeDatasetInfo';
import { mapFilterToLapisV2 } from './api-lapis-v2';

// const HOST = process.env.REACT_APP_LAPIS_HOST;
// TODO: remove this, before merging to master
const HOST = 'https://s1.int.genspectrum.org/gisaid';
// const ACCESS_KEY = process.env.REACT_APP_LAPIS_ACCESS_KEY;
const ACCESS_KEY = 'aggregatedTestKey';

let currentLapisDataVersion: number | undefined = undefined;

export const get = async (endpoint: string, signal?: AbortSignal) => {
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
  return await fetch(url, requestInit);
};

export async function fetchLapisDataVersion(signal?: AbortSignal): Promise<string> {
  let url = '/info';
  if (ACCESS_KEY) {
    url += '?accessKey=' + ACCESS_KEY;
  }
  const response = await get(url, signal);
  if (!response.ok) {
    throw new Error('Error fetching info');
  }
  const info = (await response.json()) as LapisInformation;
  currentLapisDataVersion = info.dataVersion;
  return dayjs.unix(currentLapisDataVersion).locale('en').calendar();
}

export async function fetchNextcladeDatasetInfo(signal?: AbortSignal): Promise<NextcladeDatasetInfo> {
  let url = '/aggregated?fields=nextcladeDatasetVersion';
  if (ACCESS_KEY) {
    url += '&accessKey=' + ACCESS_KEY;
  }
  const response = await get(url, signal);
  if (!response.ok) {
    throw new Error('Error fetching Nextclade dataset info');
  }
  const nexcladeDatasetInfo = (await response.json()) as LapisResponse<{ nextcladeDatasetVersion: string }[]>;
  return {
    name: 'nextclade-dataset',
    tag: nexcladeDatasetInfo.data[0].nextcladeDatasetVersion,
  };
}

export async function fetchAllHosts(): Promise<string[]> {
  let url = '/aggregated?fields=host';
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
    getMutationEndpoint(sequenceType),
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
  if (!res.ok) {
    throw new Error('Error fetching new samples data');
  }
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
    addVariantSelectorToUrlSearchParams(selector.variant, params);
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
    params.set('dataFormat', 'csv');
  }
  if (minProportion) {
    params.set('minProportion', minProportion);
  }
  if (ACCESS_KEY) {
    params.set('accessKey', ACCESS_KEY);
  }
  if (omitHost) {
    return `/${endpoint}?${params.toString()}`;
  } else {
    return `${HOST}/${endpoint}?${params.toString()}`;
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
  _additionalParams.set('fields', mapFiltersToLapisV2(fields).join(','));
  const response = await get(`${linkPrefix}&${_additionalParams}`, signal);
  if (!response.ok) {
    if (response.body !== null) {
      if ((await response.json()).errors !== undefined) {
        const errors = (await response.json()).errors as { message: string }[];
        if (errors.length > 0) {
          throw new Error(errors.map(e => e.message).join(' '));
        }
      }
    }
    throw new Error();
  }
  const body = (await response.json()) as LapisResponse<FullSampleAggEntryRaw[]>;

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

function mapFiltersToLapisV2(filters: string[]) {
  return filters.map(filter => {
    return mapFilterToLapisV2(filter);
  });
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
  if (response.errors !== undefined) {
    throw new Error('LAPIS returned an error: ' + JSON.stringify(response.errors));
  }
  if (currentLapisDataVersion === undefined) {
    currentLapisDataVersion = response.info.dataVersion;
  } else if (currentLapisDataVersion !== response.info.dataVersion) {
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
