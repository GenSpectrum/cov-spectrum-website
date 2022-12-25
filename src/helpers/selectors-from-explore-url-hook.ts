import { ExploreUrl } from './explore-url';
import { useDeepCompareMemo } from './deep-compare-hooks';
import { LocationDateSelector } from '../data/LocationDateSelector';
import { LapisSelector } from '../data/LapisSelector';
import { HostAndQcSelector } from '../data/HostAndQcSelector';

export type SingleSelectorsFromExploreUrlHook = {
  ldvsSelector: LapisSelector;
  ldsSelector: LapisSelector;
  lvsSelector: LapisSelector;
  lsSelector: LapisSelector;
  dvsSelector: LapisSelector;
  dsSelector: LapisSelector;
  lSelector: LocationDateSelector;
  hostAndQc: HostAndQcSelector;
};

export type MultipleSelectorsFromExploreUrlHook = {
  ldvsSelectors: LapisSelector[];
};

/**
 * Returns selectors that use the first variant selector only.
 */
export function useSingleSelectorsFromExploreUrl(exploreUrl: ExploreUrl): SingleSelectorsFromExploreUrlHook {
  const firstVariant = exploreUrl.variants ? exploreUrl.variants[0] : undefined;
  return useSingleSelectorsFromLapisSelector({
    location: exploreUrl.location!,
    dateRange: exploreUrl.dateRange,
    samplingStrategy: exploreUrl.samplingStrategy!,
    variant: firstVariant,
    host: exploreUrl.host,
    qc: exploreUrl.qc,
    submissionDate: exploreUrl.submissionDate,
  });
}

export function useSingleSelectorsFromLapisSelector(
  selector: LapisSelector
): SingleSelectorsFromExploreUrlHook {
  return {
    ldvsSelector: useDeepCompareMemo(
      () => ({
        location: selector.location,
        dateRange: selector.dateRange,
        samplingStrategy: selector.samplingStrategy!,
        variant: selector.variant,
        host: selector.host,
        qc: selector.qc,
        submissionDate: selector.submissionDate,
      }),
      [
        selector.dateRange,
        selector.location,
        selector.samplingStrategy,
        selector.variant,
        selector.host,
        selector.qc,
        selector.submissionDate,
      ]
    ),
    ldsSelector: useDeepCompareMemo(
      () => ({
        location: selector.location!,
        dateRange: selector.dateRange,
        samplingStrategy: selector.samplingStrategy!,
        host: selector.host,
        qc: selector.qc,
        submissionDate: selector.submissionDate,
      }),
      [
        selector.dateRange,
        selector.location,
        selector.samplingStrategy,
        selector.host,
        selector.qc,
        selector.submissionDate,
      ]
    ),
    lvsSelector: useDeepCompareMemo(
      () => ({
        location: selector.location!,
        samplingStrategy: selector.samplingStrategy!,
        variant: selector.variant,
        host: selector.host,
        qc: selector.qc,
        submissionDate: selector.submissionDate,
      }),
      [
        selector.dateRange,
        selector.location,
        selector.samplingStrategy,
        selector.variant,
        selector.host,
        selector.qc,
        selector.submissionDate,
      ]
    ),
    lsSelector: useDeepCompareMemo(
      () => ({
        location: selector.location!,
        samplingStrategy: selector.samplingStrategy!,
        host: selector.host,
        qc: selector.qc,
        submissionDate: selector.submissionDate,
      }),
      [selector.location, selector.samplingStrategy, selector.host, selector.qc, selector.submissionDate]
    ),
    dvsSelector: useDeepCompareMemo(
      () => ({
        location: {},
        dateRange: selector.dateRange,
        samplingStrategy: selector.samplingStrategy!,
        host: selector.host,
        qc: selector.qc,
        variant: selector.variant,
        submissionDate: selector.submissionDate,
      }),
      [
        selector.dateRange,
        selector.samplingStrategy,
        selector.variant,
        selector.host,
        selector.qc,
        selector.submissionDate,
      ]
    ),
    dsSelector: useDeepCompareMemo(
      () => ({
        location: {},
        dateRange: selector.dateRange,
        samplingStrategy: selector.samplingStrategy!,
        host: selector.host,
        qc: selector.qc,
        submissionDate: selector.submissionDate,
      }),
      [selector.dateRange, selector.samplingStrategy, selector.host, selector.qc, selector.submissionDate]
    ),
    lSelector: useDeepCompareMemo(
      () => ({
        location: selector.location!,
      }),
      [selector.location]
    ),
    hostAndQc: useDeepCompareMemo(
      () => ({
        host: selector.host,
        qc: selector.qc,
        submissionDate: selector.submissionDate,
      }),
      [selector.host, selector.qc, selector.submissionDate]
    ),
  };
}

export function useMultipleSelectorsFromExploreUrl(
  exploreUrl: ExploreUrl
): MultipleSelectorsFromExploreUrlHook {
  return {
    ldvsSelectors: useDeepCompareMemo(
      () =>
        (exploreUrl.variants ?? []).map(variant => ({
          location: exploreUrl.location!,
          dateRange: exploreUrl.dateRange,
          samplingStrategy: exploreUrl.samplingStrategy!,
          variant,
          host: exploreUrl.host,
          qc: exploreUrl.qc,
          submissionDate: exploreUrl.submissionDate,
        })),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        exploreUrl.variants,
        exploreUrl.host,
        exploreUrl.qc,
      ]
    ),
  };
}
