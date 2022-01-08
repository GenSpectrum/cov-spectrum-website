import { ExploreUrl } from './explore-url';
import { useDeepCompareMemo } from './deep-compare-hooks';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { LocationDateSelector } from '../data/LocationDateSelector';

export type SelectorsFromExploreUrlHook = {
  ldvsSelector: LocationDateVariantSelector;
  ldsSelector: LocationDateVariantSelector;
  lsSelector: LocationDateVariantSelector;
  dvsSelector: LocationDateVariantSelector;
  dsSelector: LocationDateVariantSelector;
  lSelector: LocationDateSelector;
};

export function useSelectorsFromExploreUrl(exploreUrl: ExploreUrl): SelectorsFromExploreUrlHook {
  return {
    ldvsSelector: useDeepCompareMemo(
      () => ({
        location: exploreUrl.location!,
        dateRange: exploreUrl.dateRange,
        samplingStrategy: exploreUrl.samplingStrategy!,
        variant: exploreUrl.variant,
      }),
      [exploreUrl.dateRange, exploreUrl.location, exploreUrl.samplingStrategy, exploreUrl.variant]
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
        variant: exploreUrl.variant,
      }),
      [exploreUrl.dateRange, exploreUrl.samplingStrategy, exploreUrl.variant]
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
