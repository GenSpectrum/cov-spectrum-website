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
        submissionDate: exploreUrl.submissionDate,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        firstVariant,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.submissionDate,
      ]
    ),
    ldsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        submissionDate: exploreUrl.submissionDate,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.submissionDate,
      ]
    ),
    lvsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        samplingStrategy: exploreUrl.samplingStrategy!,
        variant: firstVariant,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        submissionDate: exploreUrl.submissionDate,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        firstVariant,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.submissionDate,
      ]
    ),
    lsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        submissionDate: exploreUrl.submissionDate,
      }),
      [
        exploreUrl.location,
        exploreUrl.samplingStrategy,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.submissionDate,
      ]
    ),
    dvsSelector: useDeepCompareMemo(
      () => ({
        location: {},
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        variant: firstVariant,
        submissionDate: exploreUrl.submissionDate,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.samplingStrategy,
        firstVariant,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.submissionDate,
      ]
    ),
    dsSelector: useDeepCompareMemo(
      () => ({
        location: {},
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        host: exploreUrl.host,
        qc: exploreUrl.qc,
        submissionDate: exploreUrl.submissionDate,
      }),
      [
        exploreUrl.dateRange,
        exploreUrl.samplingStrategy,
        exploreUrl.host,
        exploreUrl.qc,
        exploreUrl.submissionDate,
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
        submissionDate: exploreUrl.submissionDate,
      }),
      [exploreUrl.host, exploreUrl.qc, exploreUrl.submissionDate]
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
