import assert from 'assert';
import { useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useMatch } from 'react-router';
import {
  addVariantSelectorsToUrlSearchParams,
  readVariantListFromUrlSearchParams,
  VariantSelector,
} from '../data/VariantSelector';
import {
  decodeLocationSelectorFromSingleString,
  encodeLocationSelectorToSingleString,
  LocationSelector,
} from '../data/LocationSelector';
import {
  addSubmittedDateRangeSelectorToUrlParams,
  DateRangeSelector,
  defaultSubmissionDateRangeSelector,
  readSubmissionDateRangeFromUrlSearchParams,
} from '../data/DateRangeSelector';
import {
  dateRangeUrlFromSelector,
  dateRangeUrlToSelector,
  isDateRangeEncoded,
  isSubmissionDateRangeEncoded,
  submissionDateRangeUrlToSelector,
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
import { defaultAnalysisMode, defaultDateRange, defaultSamplingStrategy } from '../data/default-selectors';

export interface ExploreUrl {
  location: LocationSelector;
  dateRange: DateRangeSelector;
  variants?: VariantSelector[];
  samplingStrategy: SamplingStrategy;
  analysisMode: AnalysisMode;
  host: HostSelector;
  qc: QcSelector;
  submissionDate: DateRangeSelector;

  setLocation: (location: LocationSelector) => void;
  setDateRange: (dateRange: DateRangeSelector) => void;
  setVariants: (variants: VariantSelector[], analysisMode?: AnalysisMode) => void;
  setAnalysisMode: (analysisMode: AnalysisMode) => void;
  setSamplingStrategy: (samplingStrategy: SamplingStrategy) => void;
  setHostAndQc: (
    host?: HostSelector,
    qc?: QcSelector,
    submissionDateRangeSelector?: DateRangeSelector
  ) => void;
  getOverviewPageUrl: () => string;
  getExplorePageUrl: () => string;
  getDeepExplorePageUrl: (pagePath: string) => string;
  getDeepFocusPageUrl: (pagePath: string) => string;
  focusKey: string;
}

export function useExploreUrl(): ExploreUrl | undefined {
  const navigate = useNavigate();
  const locationState = useLocation();

  const routeMatches = {
    explore: useMatch({ path: `/explore/`, end: false }),
    country: useMatch({ path: `/explore/:location`, end: false }),
    locationSampling: useMatch({ path: `/explore/:location/:samplingStrategy`, end: false }),
    locationSamplingDate: useMatch({ path: `/explore/:location/:samplingStrategy/:dateRange`, end: false }),
    locationSamplingDateVariant: useMatch({
      path: `/explore/:location/:samplingStrategy/:dateRange/variants`,
      end: false,
    }),
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
      assert(decodeURIComponent(currentPath).startsWith(oldPrefix));
      const suffix = currentPath.slice(oldPrefix.length);
      const locationEncoded = encodeLocationSelectorToSingleString(location);
      navigate(`/explore/${locationEncoded}/${suffix}`);
    },
    [navigate, locationState.pathname, locationState.search, routeMatches.locationSamplingDate]
  );
  const setSamplingStrategy = useCallback(
    (samplingStrategy: SamplingStrategy) => {
      if (!routeMatches.locationSamplingDate) {
        return;
      }
      const oldPrefix = `/explore/${routeMatches.locationSamplingDate.params.location}/${routeMatches.locationSamplingDate.params.samplingStrategy}/`;
      const currentPath = locationState.pathname + locationState.search;
      assert(decodeURIComponent(currentPath).startsWith(oldPrefix));
      const suffix = currentPath.slice(oldPrefix.length);
      navigate(`/explore/${routeMatches.locationSamplingDate.params.location}/${samplingStrategy}/${suffix}`);
    },
    [navigate, locationState.pathname, locationState.search, routeMatches.locationSamplingDate]
  );
  const setDateRange = useCallback(
    (dateRange: DateRangeSelector) => {
      if (!routeMatches.locationSamplingDate) {
        return;
      }
      const oldPrefix = `/explore/${routeMatches.locationSamplingDate.params.location}/${routeMatches.locationSamplingDate.params.samplingStrategy}/${routeMatches.locationSamplingDate.params.dateRange}`;
      const currentPath = locationState.pathname + locationState.search;
      assert(decodeURIComponent(currentPath).startsWith(oldPrefix));
      const suffix = currentPath.slice(oldPrefix.length);
      const dateRangeEncoded = dateRangeUrlFromSelector(dateRange);
      navigate(
        `/explore/${routeMatches.locationSamplingDate.params.location}/${routeMatches.locationSamplingDate.params.samplingStrategy}/${dateRangeEncoded}${suffix}`
      );
    },
    [navigate, locationState.pathname, locationState.search, routeMatches.locationSamplingDate]
  );
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
      assert(decodeURIComponent(currentPath).startsWith(prefix));
      const path = `${prefix}/variants?${newQueryParam}&`;
      navigate(path);
    },
    [navigate, locationState.pathname, locationState.search, queryString, routeMatches.locationSamplingDate]
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
      assert(decodeURIComponent(currentPath).startsWith(prefix));
      let path = `${prefix}/variants?${newQueryParam}&`;
      navigate(path);
    },
    [navigate, locationState.pathname, locationState.search, queryString, routeMatches.locationSamplingDate]
  );
  const setHostAndQc = useCallback(
    (host?: HostSelector, qc?: QcSelector, submissionDateRange?: DateRangeSelector) => {
      const newQueryParam = new URLSearchParams(queryString);
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

      if (submissionDateRange) {
        addSubmittedDateRangeSelectorToUrlParams(newQueryParam, submissionDateRange);
      }

      const path = `${locationState.pathname}?${newQueryParam}&`;
      navigate(path);
    },
    [navigate, locationState.pathname, queryString]
  );

  // Get URL functions
  const getOverviewPageUrl = useCallback(() => {
    return `${routeMatches.locationSamplingDate?.pathname}/variants${locationState.search}`;
  }, [locationState.search, routeMatches.locationSamplingDate?.pathname]);
  const getExplorePageUrl = useCallback(() => {
    return `${routeMatches.locationSamplingDate?.pathname}`;
  }, [routeMatches.locationSamplingDate?.pathname]);
  const getDeepExplorePageUrl = useCallback(
    (pagePath: string) => {
      return `${routeMatches.locationSamplingDate?.pathname}${pagePath}${locationState.search}`;
    },
    [locationState.search, routeMatches.locationSamplingDate?.pathname]
  );
  const getDeepFocusPageUrl = useCallback(
    (pagePath: string) => {
      return `${routeMatches.locationSamplingDate?.pathname}/variants${pagePath}${locationState.search}`;
    },
    [locationState.search, routeMatches.locationSamplingDate?.pathname]
  );

  // Parse from query params
  const { variants, analysisMode, host, qc, submissionDate } = useMemo(() => {
    const submissionDate = readSubmissionDateRangeFromUrlSearchParams(query);

    return {
      variants: readVariantListFromUrlSearchParams(query),
      analysisMode: decodeAnalysisMode(query.get('analysisMode')) ?? defaultAnalysisMode,
      host: readHostSelectorFromUrlSearchParams(query),
      qc: readQcSelectorFromUrlSearchParams(query),
      submissionDate: isSubmissionDateRangeEncoded(submissionDate)
        ? submissionDateRangeUrlToSelector(submissionDate)
        : defaultSubmissionDateRangeSelector,
    };
  }, [query]);

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
      navigate(`/explore/${location}/${samplingStrategy}/`);
    } else if (routeMatches.country) {
      const { location } = routeMatches.country.params;
      navigate(`/explore/${location}/${defaultSamplingStrategy}/${defaultDateRange}`);
    } else if (routeMatches.explore) {
      navigate(`/explore/${baseLocation}/${defaultSamplingStrategy}/${defaultDateRange}`);
    }
    // Don't redirect/do anything if /explore/ is not matched.
    return undefined;
  }

  // Redirect if something is not alright with the params
  if (pathParams.samplingStrategy === null) {
    // Redirecting because of an invalid sampling strategy
    navigate(`/explore/${encoded.location}/${defaultSamplingStrategy}/${encoded.dateRange}`);
    return undefined;
  }
  if (pathParams.dateRange === null) {
    // Redirecting because of an invalid date range
    navigate(`/explore/${encoded.location}/${encoded.samplingStrategy}/${defaultDateRange}`);
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
    submissionDate,

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
