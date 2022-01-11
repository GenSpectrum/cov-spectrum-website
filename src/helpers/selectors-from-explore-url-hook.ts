import { ExploreUrl } from './explore-url';
import { useDeepCompareMemo } from './deep-compare-hooks';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { LocationDateSelector } from '../data/LocationDateSelector';

export type SingleSelectorsFromExploreUrlHook = {
  ldvsSelector: LocationDateVariantSelector;
  ldsSelector: LocationDateVariantSelector;
  lsSelector: LocationDateVariantSelector;
  dvsSelector: LocationDateVariantSelector;
  dsSelector: LocationDateVariantSelector;
  lSelector: LocationDateSelector;
};

export type MultipleSelectorsFromExploreUrlHook = {
  ldvsSelectors: LocationDateVariantSelector[];
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
      }),
      [exploreUrl.dateRange, exploreUrl.location, exploreUrl.samplingStrategy, firstVariant]
    ),
    ldsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
      }),
      [exploreUrl.dateRange, exploreUrl.location, exploreUrl.samplingStrategy]
    ),
    lsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        samplingStrategy: exploreUrl.samplingStrategy!,
      }),
      [exploreUrl.location, exploreUrl.samplingStrategy]
    ),
    dvsSelector: useDeepCompareMemo(
      () => ({
        location: {},
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        variant: firstVariant,
      }),
      [exploreUrl.dateRange, exploreUrl.samplingStrategy, firstVariant]
    ),
    dsSelector: useDeepCompareMemo(
      () => ({
        location: {},
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
      }),
      [exploreUrl.dateRange, exploreUrl.samplingStrategy]
    ),
    lSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
      }),
      [exploreUrl.location]
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
        })),
      [exploreUrl.dateRange, exploreUrl.location, exploreUrl.samplingStrategy, exploreUrl.variants]
    ),
  };
}
