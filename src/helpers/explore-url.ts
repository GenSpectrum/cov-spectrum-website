import assert from 'assert';
import { useCallback, useEffect, useMemo } from 'react';
import { generatePath, useHistory, useLocation, useRouteMatch } from 'react-router';
import { Location, createLocation } from 'history';
import { ZodQueryEncoder } from '../helpers/query-encoder';
import { VariantSelector, VariantSelectorSchema } from '../helpers/sample-selector';
import { DateRange, isDateRange, isSamplingStrategy, SamplingStrategy } from '../services/api';
import { Country } from '../services/api-types';

const queryEncoder = new ZodQueryEncoder(VariantSelectorSchema);

export interface ExploreUrl {
  country: Country;
  setCountry: (country: string) => void;
  samplingStrategy: SamplingStrategy;
  setSamplingStrategy: (samplingStrategy: SamplingStrategy) => void;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  variantSelector?: VariantSelector;
  focusKey: string;
}

export function useExploreUrl(): ExploreUrl | undefined {
  const history = useHistory();
  const location = useLocation();

  const baseRouteMatch = useRouteMatch<{ country: string; samplingStrategy: string; dateRange: string }>(
    `/explore/:country/:samplingStrategy/:dateRange`
  );
  const variantRouteMatch = useRouteMatch<{
    country: string;
    samplingStrategy: string;
    dateRange: string;
    variantSelector: string;
  }>(`/explore/:country/:samplingStrategy/:dateRange/variants/:variantSelector`);

  const samplingStrategy = baseRouteMatch?.params.samplingStrategy;
  useEffect(() => {
    if (!baseRouteMatch) {
      if (
        location.pathname.startsWith('/explore/') &&
        !location.pathname.endsWith(`/${SamplingStrategy.AllSamples}`)
      ) {
        // This is probably an old URL with no focused variant
        history.push(`${location.pathname.replace(/\/$/, '')}/${SamplingStrategy.AllSamples}`);
      } else if (location.pathname.startsWith('/explore/')) {
        // We can't redirect anywhere better without the information from baseRouteMatch
        console.warn('invalid URL - redirecting home', location.pathname);
        history.push('/');
      } else {
        // We shouldn't redirect here, because that will make pages like /login unreachable
      }
    } else if (samplingStrategy === 'variants') {
      // Redirect from our old URL style
      const prefix = `/explore/${baseRouteMatch.params.country}/`;
      assert(location.pathname.startsWith(prefix));
      const suffix = location.pathname.slice(prefix.length);
      history.push(`${prefix}${SamplingStrategy.AllSamples}/${suffix}`);
    } else if (typeof samplingStrategy === 'string' && !isSamplingStrategy(samplingStrategy)) {
      // Better to show all samples then to show a blank page
      const oldPrefix = `/explore/${baseRouteMatch.params.country}/${samplingStrategy}`;
      assert(location.pathname.startsWith(oldPrefix));
      const suffix = location.pathname.slice(oldPrefix.length);
      history.push(`/explore/${baseRouteMatch.params.country}/${SamplingStrategy.AllSamples}${suffix}`);
    }
  }, [location.pathname, baseRouteMatch, history, samplingStrategy]);

  const encodedVariantSelector = variantRouteMatch?.params.variantSelector;
  const variantSelector = useMemo(() => {
    try {
      if (encodedVariantSelector) {
        return queryEncoder.decode(new URLSearchParams(encodedVariantSelector));
      }
    } catch (err) {
      console.error('could not decode variant selector', encodedVariantSelector);
    }
  }, [encodedVariantSelector]);

  const country = baseRouteMatch?.params.country;

  const setCountryAndSamplingStrategy = useCallback(
    (newCountry: string, newSamplingStrategy: SamplingStrategy) => {
      if (!country || !samplingStrategy) {
        throw new Error(
          'setCountryAndSamplingStrategy call without defined country or samplingStrategy (should be unreachable)'
        );
      }
      if (country !== 'Switzerland' && newSamplingStrategy !== SamplingStrategy.AllSamples) {
        throw new Error('SamplingStrategy.AllSamples only works for Switzerland');
      }
      const oldPrefix = `/explore/${country}/${samplingStrategy}`;
      assert(location.pathname.startsWith(oldPrefix));
      const suffix = location.pathname.slice(oldPrefix.length);
      history.push(`/explore/${newCountry}/${newSamplingStrategy}${suffix}`);
    },
    [history, location.pathname, country, samplingStrategy]
  );

  const setCountry = useCallback(
    (newCountry: string) => {
      if (!samplingStrategy) {
        throw new Error('setCountry call without defined samplingStrategy (should be unreachable)');
      }
      const newSamplingStrategy =
        newCountry === 'Switzerland' && isSamplingStrategy(samplingStrategy)
          ? samplingStrategy
          : SamplingStrategy.AllSamples;
      setCountryAndSamplingStrategy(newCountry, newSamplingStrategy);
    },
    [setCountryAndSamplingStrategy, samplingStrategy]
  );

  const setSamplingStrategy = useCallback(
    (newSamplingStrategy: SamplingStrategy) => {
      if (!country) {
        throw new Error('setSamplingStrategy call without defined country (should be unreachable)');
      }
      setCountryAndSamplingStrategy(country, newSamplingStrategy);
    },
    [setCountryAndSamplingStrategy, country]
  );

  const dateRange = baseRouteMatch?.params.dateRange;

  const setDateRange = useCallback(
    (newDateRange: string) => {
      const oldPrefix = `/explore/${country}/${samplingStrategy}/${dateRange}`;
      assert(location.pathname.startsWith(oldPrefix));
      const suffix = location.pathname.slice(oldPrefix.length);
      history.push(`/explore/${country}/${samplingStrategy}/${newDateRange}${suffix}`);
    },
    [history, location.pathname, country, samplingStrategy, dateRange]
  );

  useEffect(() => {
    if (
      country !== undefined &&
      country !== 'Switzerland' &&
      isSamplingStrategy(samplingStrategy) &&
      samplingStrategy !== SamplingStrategy.AllSamples
    ) {
      setSamplingStrategy(SamplingStrategy.AllSamples);
    }
  }, [setSamplingStrategy, country, samplingStrategy]);

  if (!baseRouteMatch || !country) {
    return undefined;
  }

  if (!samplingStrategy || !isSamplingStrategy(samplingStrategy)) {
    console.error('invalid samplingStrategy in URL', samplingStrategy);
    // The useEffect above will attempt to recover from this
    return undefined;
  }

  if (country !== 'Switzerland' && samplingStrategy !== SamplingStrategy.AllSamples) {
    // The useEffect above will redirect to AllSamples
    return undefined;
  }

  if (!dateRange || !isDateRange(dateRange)) {
    return undefined;
  }

  if (variantRouteMatch) {
    assert.strictEqual(baseRouteMatch.params.country, variantRouteMatch.params.country);
    assert.strictEqual(baseRouteMatch.params.samplingStrategy, variantRouteMatch.params.samplingStrategy);
    assert.strictEqual(baseRouteMatch.params.dateRange, variantRouteMatch.params.dateRange);
  }

  return {
    country,
    setCountry,
    samplingStrategy,
    setSamplingStrategy,
    dateRange,
    setDateRange,
    variantSelector,
    focusKey: `${country}-${samplingStrategy}-${dateRange}-${encodedVariantSelector}`,
  };
}

export function getFocusPageLink({
  variantSelector,
  country,
  samplingStrategy,
  dateRange,
  deepFocusPath = '',
}: {
  variantSelector: VariantSelector;
  country: Country;
  samplingStrategy: SamplingStrategy;
  dateRange: DateRange;
  deepFocusPath?: string;
}): Location {
  assert(!deepFocusPath || deepFocusPath.startsWith('/'));

  // createLocation is used here because react-router usually normalizes URLs.
  // If we don't normalize our URLs as well by calling createLocation, then they
  // may be slightly different than the ones that react-router makes. This can cause
  // useless reloads.
  // Specifically the "Back to overview" button used to trigger a reload of data for
  // the focus page, because the encoding of square brackets in the URL would change,
  // which changed the reference equality of variantSelector from useExploreUrl,
  // which caused all hooks which depend on variantSelector to be re-run.
  return createLocation(
    generatePath(`/explore/${country}/${samplingStrategy}/${dateRange}/variants/:variantSelector`, {
      variantSelector: queryEncoder.encode(variantSelector).toString(),
    }) + deepFocusPath,
    undefined,
    undefined,
    undefined
  );
}
