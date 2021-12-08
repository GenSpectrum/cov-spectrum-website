import assert from 'assert';
import { useCallback } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { VariantSelector, variantUrlFromSelector } from '../data/VariantSelector';
import {
  decodeLocationSelectorFromSingleString,
  encodeLocationSelectorToSingleString,
  LocationSelector,
} from '../data/LocationSelector';
import { DateRangeSelector } from '../data/DateRangeSelector';
import {
  DateRangeUrlEncoded,
  dateRangeUrlFromSelector,
  dateRangeUrlToSelector,
  isDateRangeEncoded,
} from '../data/DateRangeUrlEncoded';
import { decodeSamplingStrategy, SamplingStrategy } from '../data/SamplingStrategy';
import { baseLocation } from '../index';

export interface ExploreUrl {
  validUrl: true;
  location: LocationSelector;
  dateRange: DateRangeSelector;
  variant?: VariantSelector;
  samplingStrategy: SamplingStrategy;

  setLocation: (location: LocationSelector) => void;
  setDateRange: (dateRange: DateRangeSelector) => void;
  setVariant: (variant: VariantSelector) => void;
  setSamplingStrategy: (samplingStrategy: SamplingStrategy) => void;
  getOverviewPageUrl: () => string;
  getDeepExplorePageUrl: (pagePath: string) => string;
  getDeepFocusPageUrl: (pagePath: string) => string;
  focusKey: string;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const defaultDateRange: DateRangeUrlEncoded = 'AllTimes';

const defaultSamplingStrategy: SamplingStrategy = SamplingStrategy.AllSamples;

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
  let query = useQuery();

  // Create navigation functions
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
  const setVariant = useCallback(
    (variant: VariantSelector) => {
      if (!routeMatches.locationSamplingDate) {
        return;
      }
      const prefix = `/explore/${routeMatches.locationSamplingDate.params.location}/${routeMatches.locationSamplingDate.params.samplingStrategy}/${routeMatches.locationSamplingDate.params.dateRange}`;
      const currentPath = locationState.pathname + locationState.search;
      assert(currentPath.startsWith(prefix));
      const variantEncoded = variantUrlFromSelector(variant);
      history.push(`${prefix}/variants?${variantEncoded}`);
    },
    [history, locationState.pathname, locationState.search, routeMatches.locationSamplingDate]
  );
  const getOverviewPageUrl = useCallback(() => {
    return `${routeMatches.locationSamplingDate?.url}/variants${locationState.search}`;
  }, [locationState.search, routeMatches.locationSamplingDate?.url]);
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

  // Redirecting if the explore URL is not complete
  if (!routeMatches.locationSamplingDate) {
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

  const encoded = {
    location: routeMatches.locationSamplingDate.params.location,
    dateRange: routeMatches.locationSamplingDate.params.dateRange,
    samplingStrategy: routeMatches.locationSamplingDate.params.samplingStrategy,
  };

  // Parse location and date range
  const locationSelector = decodeLocationSelectorFromSingleString(encoded.location);
  const samplingStrategy = decodeSamplingStrategy(encoded.samplingStrategy);
  if (samplingStrategy === null) {
    // Redirecting because of an invalid sampling strategy
    history.push(`/explore/${encoded.location}/${defaultSamplingStrategy}/${encoded.dateRange}`);
    return undefined;
  }
  if (!isDateRangeEncoded(encoded.dateRange)) {
    // Redirecting because of an invalid date range
    history.push(`/explore/${encoded.location}/${encoded.samplingStrategy}/${defaultDateRange}`);
    return undefined;
  }
  const dateRangeSelector = dateRangeUrlToSelector(encoded.dateRange);

  // Get variant selector if given
  let variantSelector: VariantSelector | undefined = undefined;
  if (routeMatches.locationSamplingDateVariant) {
    variantSelector = {
      pangoLineage: query.get('pangoLineage') ?? undefined,
      gisaidClade: query.get('gisaidClade') ?? undefined,
      nextstrainClade: query.get('nextstrainClade') ?? undefined,
      aaMutations: query.get('aaMutations')?.split(','),
      nucMutations: query.get('nucMutations')?.split(','),
      variantQuery: query.get('variantQuery') ?? undefined,
    };
  }

  return {
    validUrl: true,
    location: locationSelector,
    dateRange: dateRangeSelector,
    variant: variantSelector,
    samplingStrategy,

    setLocation,
    setSamplingStrategy,
    setDateRange,
    setVariant,
    getOverviewPageUrl,
    getDeepExplorePageUrl,
    getDeepFocusPageUrl,
    focusKey: locationState.pathname + locationState.search,
  };
}
