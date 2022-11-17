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
        dateSubmittedRaw: exploreUrl.dateSubmittedRaw,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        firstVariant,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmittedRaw,
      ]
    ),
    ldsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmittedRaw: exploreUrl.dateSubmittedRaw,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmittedRaw,
      ]
    ),
    lvsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        samplingStrategy: exploreUrl.samplingStrategy!,
        variant: firstVariant,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmittedRaw: exploreUrl.dateSubmittedRaw,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        firstVariant,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmittedRaw,
      ]
    ),
    lsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmittedRaw: exploreUrl.dateSubmittedRaw,
      }),
      [
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmittedRaw,
      ]
    ),
    dvsSelector: useDeepCompareMemo(
      () => ({
        location: {},
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmittedRaw: exploreUrl.dateSubmittedRaw,
        variant: firstVariant,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.samplingStrategy,
        firstVariant,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmittedRaw,
      ]
    ),
    dsSelector: useDeepCompareMemo(
      () => ({
        location: {},
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        dateSubmittedRaw: exploreUrl.dateSubmittedRaw,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.samplingStrategy,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.dateSubmittedRaw,
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
        dateSubmittedRaw: exploreUrl.dateSubmittedRaw,
      }),
      [exploreUrl.host, exploreUrl.qc, exploreUrl.dateSubmittedRaw]
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
