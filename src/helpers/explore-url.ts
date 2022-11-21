import assert from 'assert';
import { useCallback, useMemo } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import {
  readVariantListFromUrlSearchParams,
  addVariantSelectorsToUrlSearchParams,
  VariantSelector,
} from '../data/VariantSelector';
import {
  decodeLocationSelectorFromSingleString,
  encodeLocationSelectorToSingleString,
  LocationSelector,
} from '../data/LocationSelector';
import {
  addSubmittedDateRangeSelectorToUrlParams,
  DateRangeRaw,
  DateRangeSelector,
  isSpecialDateRange,
  // isSpecialDateRange,
  readDateRangeRawFromUrlSearchParams,
  SpecialDateRange,
  // SpecialDateRange,
  // SpecialDateRangeSelector,
} from '../data/DateRangeSelector';
import {
  DateRangeUrlEncoded,
  dateRangeUrlFromSelector,
  dateRangeUrlToSelector,
  // deleteSubmissionDateParams,
  isDateRangeEncoded,
  //  submissionDateRangeUrlFromSelector,
} from '../data/DateRangeUrlEncoded';
import { decodeSamplingStrategy, SamplingStrategy } from '../data/SamplingStrategy';
import { baseLocation } from '../index';
import { AnalysisMode, decodeAnalysisMode } from '../data/AnalysisMode';
import {
  addHostSelectorToUrlSearchParams,
  HostSelector,
  isDefaultHostSelector,
  readHostSelectorFromUrlSearchParams,
} from '../data/HostSelector';
import {
  addQcSelectorToUrlSearchParams,
  QcSelector,
  readQcSelectorFromUrlSearchParams,
} from '../data/QcSelector';
import { HUMAN } from '../data/api-lapis';

export interface ExploreUrl {
  location: LocationSelector;
  dateRange: DateRangeSelector;
  variants?: VariantSelector[];
  samplingStrategy: SamplingStrategy;
  analysisMode: AnalysisMode;
  host: HostSelector;
  qc: QcSelector;
  dateSubmitted?: DateRangeRaw;

  setLocation: (location: LocationSelector) => void;
  setDateRange: (dateRange: DateRangeSelector) => void;
  setVariants: (variants: VariantSelector[], analysisMode?: AnalysisMode) => void;
  setAnalysisMode: (analysisMode: AnalysisMode) => void;
  setSamplingStrategy: (samplingStrategy: SamplingStrategy) => void;
  setHostAndQc: (
    host?: HostSelector,
    qc?: QcSelector,
    submissionDateRange?: DateRangeSelector,
    specialSubmissionDateRaw?: string | null
  ) => void;
  getOverviewPageUrl: () => string;
  getExplorePageUrl: () => string;
  getDeepExplorePageUrl: (pagePath: string) => string;
  getDeepFocusPageUrl: (pagePath: string) => string;
  focusKey: string;
}

export const defaultDateRange: DateRangeUrlEncoded = 'Past6M';

export const defaultSamplingStrategy: SamplingStrategy = SamplingStrategy.AllSamples;

export const defaultAnalysisMode: AnalysisMode = AnalysisMode.Single;

export const defaultHost: HostSelector = [HUMAN];

export function useExploreUrl(): ExploreUrl | undefined {
  const history = useHistory();
  const locationState = useLocation();

  const routeMatches = {
    explore: useRouteMatch<{}>(`/explore/`),
    country: useRouteMatch<{ location: string }>(`/explore/:location/`),
    locationSampling: useRouteMatch<{ location: string; samplingStrategy: string }>(
      `/explore/:location/:samplingStrategy`
    ),
    locationSamplingDate: useRouteMatch<{ location: string; samplingStrategy: string; dateRange: string }>(
      `/explore/:location/:samplingStrategy/:dateRange`
    ),
    locationSamplingDateVariant: useRouteMatch<{
      location: string;
      samplingStrategy: string;
      dateRange: string;
    }>(`/explore/:location/:samplingStrategy/:dateRange/variants`),
  };
  let queryString = useLocation().search;
  let query = useMemo(() => new URLSearchParams(queryString), [queryString]);

  // Navigation functions
  const setLocation = useCallback(
    (location: LocationSelector) => {
      if (!routeMatches.locationSamplingDate) {
        return;
      }
      const oldPrefix = `/explore/${routeMatches.locationSamplingDate.params.location}/`;
      const currentPath = locationState.pathname + locationState.search;
      assert(currentPath.startsWith(oldPrefix));
      const suffix = currentPath.slice(oldPrefix.length);
      const locationEncoded = encodeLocationSelectorToSingleString(location);
      history.push(`/explore/${locationEncoded}/${suffix}`);
    },
    [history, locationState.pathname, locationState.search, routeMatches.locationSamplingDate]
  );
  const setSamplingStrategy = useCallback(
    (samplingStrategy: SamplingStrategy) => {
      if (!routeMatches.locationSamplingDate) {
        return;
      }
      const oldPrefix = `/explore/${routeMatches.locationSamplingDate.params.location}/${routeMatches.locationSamplingDate.params.samplingStrategy}/`;
      const currentPath = locationState.pathname + locationState.search;
      assert(currentPath.startsWith(oldPrefix));
      const suffix = currentPath.slice(oldPrefix.length);
      history.push(
        `/explore/${routeMatches.locationSamplingDate.params.location}/${samplingStrategy}/${suffix}`
      );
    },
    [history, locationState.pathname, locationState.search, routeMatches.locationSamplingDate]
  );
  const setDateRange = useCallback(
    (dateRange: DateRangeSelector) => {
      if (!routeMatches.locationSamplingDate) {
        return;
      }
      const oldPrefix = `/explore/${routeMatches.locationSamplingDate.params.location}/${routeMatches.locationSamplingDate.params.samplingStrategy}/${routeMatches.locationSamplingDate.params.dateRange}`;
      const currentPath = locationState.pathname + locationState.search;
      assert(currentPath.startsWith(oldPrefix));
      const suffix = currentPath.slice(oldPrefix.length);
      const dateRangeEncoded = dateRangeUrlFromSelector(dateRange);
      history.push(
        `/explore/${routeMatches.locationSamplingDate.params.location}/${routeMatches.locationSamplingDate.params.samplingStrategy}/${dateRangeEncoded}${suffix}`
      );
    },
    [history, locationState.pathname, locationState.search, routeMatches.locationSamplingDate]
  );

  // http://localhost:3000/explore/Switzerland/AllSamples/Y2020/variants?dateSubmittedFrom=2022-05-09&dateSubmittedTo=2022-11-03&dateSubmittedFrom=2020-01-06&dateSubmittedTo=2022-11-10&nextcladeQcOverallScoreTo=29&dateSubmittedFrom=2022-10-27&dateSubmittedTo=2022-11-03

  const setVariants = useCallback(
    (variants: VariantSelector[], analysisMode?: AnalysisMode) => {
      if (!routeMatches.locationSamplingDate) {
        return;
      }
      const prefix = `/explore/${routeMatches.locationSamplingDate.params.location}/${routeMatches.locationSamplingDate.params.samplingStrategy}/${routeMatches.locationSamplingDate.params.dateRange}`;
      const newQueryParam = new URLSearchParams(queryString);
      addVariantSelectorsToUrlSearchParams(variants, newQueryParam);
      if (analysisMode) {
        newQueryParam.delete('analysisMode');
        if (analysisMode !== defaultAnalysisMode) {
          newQueryParam.set('analysisMode', analysisMode);
        }
      }
      const currentPath = locationState.pathname + locationState.search;
      assert(currentPath.startsWith(prefix));
      const path = `${prefix}/variants?${newQueryParam}&`;
      history.push(path);
    },
    [history, locationState.pathname, locationState.search, queryString, routeMatches.locationSamplingDate]
  );
  const setAnalysisMode = useCallback(
    (analysisMode: AnalysisMode) => {
      if (!routeMatches.locationSamplingDate) {
        return;
      }
      const prefix = `/explore/${routeMatches.locationSamplingDate.params.location}/${routeMatches.locationSamplingDate.params.samplingStrategy}/${routeMatches.locationSamplingDate.params.dateRange}`;
      const newQueryParam = new URLSearchParams(queryString);
      newQueryParam.delete('analysisMode');
      if (analysisMode !== defaultAnalysisMode) {
        newQueryParam.set('analysisMode', analysisMode);
      }
      const currentPath = locationState.pathname + locationState.search;
      assert(currentPath.startsWith(prefix));
      let path = `${prefix}/variants?${newQueryParam}&`;
      history.push(path);
    },
    [history, locationState.pathname, locationState.search, queryString, routeMatches.locationSamplingDate]
  );
  const setHostAndQc = useCallback(
    (
      host?: HostSelector,
      qc?: QcSelector,
      submissionDateRange?: DateRangeSelector,
      specialSubmissionDateRaw?: string | null
    ) => {
      const newQueryParam = new URLSearchParams(queryString);

      const _specialDateRange: SpecialDateRange | null = isSpecialDateRange(specialSubmissionDateRaw)
        ? specialSubmissionDateRaw
        : null;

      if (submissionDateRange) {
        addSubmittedDateRangeSelectorToUrlParams(
          submissionDateRange,
          newQueryParam,
          specialSubmissionDateRaw
        );
      }

      if (host) {
        if (isDefaultHostSelector(host)) {
          addHostSelectorToUrlSearchParams([], newQueryParam);
        } else {
          addHostSelectorToUrlSearchParams(host, newQueryParam);
        }
      }
      if (qc) {
        addQcSelectorToUrlSearchParams(qc, newQueryParam);
      }

      const path = `${locationState.pathname}?${newQueryParam}`; // `${locationState.pathname}?${newQueryParam}&${submissionDatePaparms}`;
      history.push(path);
    },
    [history, locationState.pathname, queryString]
  );

  // Get URL functions
  const getOverviewPageUrl = useCallback(() => {
    return `${routeMatches.locationSamplingDate?.url}/variants${locationState.search}`;
  }, [locationState.search, routeMatches.locationSamplingDate?.url]);
  const getExplorePageUrl = useCallback(() => {
    return `${routeMatches.locationSamplingDate?.url}`;
  }, [routeMatches.locationSamplingDate?.url]);
  const getDeepExplorePageUrl = useCallback(
    (pagePath: string) => {
      return `${routeMatches.locationSamplingDate?.url}${pagePath}${locationState.search}`;
    },
    [locationState.search, routeMatches.locationSamplingDate?.url]
  );
  const getDeepFocusPageUrl = useCallback(
    (pagePath: string) => {
      return `${routeMatches.locationSamplingDate?.url}/variants${pagePath}${locationState.search}`;
    },
    [locationState.search, routeMatches.locationSamplingDate?.url]
  );

  // Parse from query params
  const { variants, analysisMode, host, qc, dateSubmitted } = useMemo(
    () => ({
      variants: readVariantListFromUrlSearchParams(query),
      analysisMode: decodeAnalysisMode(query.get('analysisMode')) ?? defaultAnalysisMode,
      host: readHostSelectorFromUrlSearchParams(query),
      qc: readQcSelectorFromUrlSearchParams(query),
      dateSubmitted: readDateRangeRawFromUrlSearchParams(query),
    }),
    [query]
  );

  // Parse from path params
  const encoded = {
    location: routeMatches.locationSamplingDate?.params.location,
    dateRange: routeMatches.locationSamplingDate?.params.dateRange,
    samplingStrategy: routeMatches.locationSamplingDate?.params.samplingStrategy,
  };
  const pathParams = useMemo(() => {
    if (!encoded.location || !encoded.dateRange || !encoded.samplingStrategy) {
      return undefined;
    }
    return {
      location: decodeLocationSelectorFromSingleString(encoded.location),
      samplingStrategy: decodeSamplingStrategy(encoded.samplingStrategy),
      dateRange: isDateRangeEncoded(encoded.dateRange) ? dateRangeUrlToSelector(encoded.dateRange) : null,
    };
  }, [encoded.dateRange, encoded.location, encoded.samplingStrategy]);

  // Redirecting if the explore URL is not complete
  if (!routeMatches.locationSamplingDate || !pathParams) {
    if (routeMatches.locationSampling) {
      const { location, samplingStrategy } = routeMatches.locationSampling.params;
      history.push(`/explore/${location}/${samplingStrategy}/`);
    } else if (routeMatches.country) {
      const { location } = routeMatches.country.params;
      history.push(`/explore/${location}/${defaultSamplingStrategy}/${defaultDateRange}`);
    } else if (routeMatches.explore) {
      history.push(`/explore/${baseLocation}/${defaultSamplingStrategy}/${defaultDateRange}`);
    }
    // Don't redirect/do anything if /explore/ is not matched.
    return undefined;
  }

  // Redirect if something is not alright with the params
  if (pathParams.samplingStrategy === null) {
    // Redirecting because of an invalid sampling strategy
    history.push(`/explore/${encoded.location}/${defaultSamplingStrategy}/${encoded.dateRange}`);
    return undefined;
  }
  if (pathParams.dateRange === null) {
    // Redirecting because of an invalid date range
    history.push(`/explore/${encoded.location}/${encoded.samplingStrategy}/${defaultDateRange}`);
    return undefined;
  }

  return {
    location: pathParams.location,
    dateRange: pathParams.dateRange,
    samplingStrategy: pathParams.samplingStrategy,
    variants: routeMatches.locationSamplingDateVariant !== null ? variants : undefined,
    analysisMode,
    host,
    qc,
    dateSubmitted,
    setLocation,
    setSamplingStrategy,
    setDateRange,
    setVariants,
    setAnalysisMode,
    setHostAndQc,
    getOverviewPageUrl,
    getExplorePageUrl,
    getDeepExplorePageUrl,
    getDeepFocusPageUrl,

    focusKey: locationState.pathname + locationState.search,
  };
}
