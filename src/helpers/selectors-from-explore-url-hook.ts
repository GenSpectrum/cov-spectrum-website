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
  return {
    ldvsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        variant: firstVariant,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmitted: exploreUrl.dateSubmitted,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        firstVariant,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmitted,
      ]
    ),
    ldsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmitted: exploreUrl.dateSubmitted,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmitted,
      ]
    ),
    lvsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        samplingStrategy: exploreUrl.samplingStrategy!,
        variant: firstVariant,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmitted: exploreUrl.dateSubmitted,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        firstVariant,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmitted,
      ]
    ),
    lsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmitted: exploreUrl.dateSubmitted,
      }),
      [
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmitted,
      ]
    ),
    dvsSelector: useDeepCompareMemo(
      () => ({
        location: {},
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmitted: exploreUrl.dateSubmitted,
        variant: firstVariant,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.samplingStrategy,
        firstVariant,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmitted,
      ]
    ),
    dsSelector: useDeepCompareMemo(
      () => ({
        location: {},
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmitted: exploreUrl.dateSubmitted,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.samplingStrategy,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmitted,
      ]
    ),
    lSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
      }),
      [exploreUrl.location]
    ),
    hostAndQc: useDeepCompareMemo(
      () => ({
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmitted: exploreUrl.dateSubmitted,
      }),
      [exploreUrl.host, exploreUrl.qc, exploreUrl.dateSubmitted]
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
          dateSubmitted: exploreUrl.dateSubmitted,
        })),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        exploreUrl.variants,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmitted,
      ]
    ),
  };
}
