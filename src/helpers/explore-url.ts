import assert from 'assert';
import { useCallback, useEffect, useMemo } from 'react';
import { generatePath, useHistory, useLocation, useRouteMatch } from 'react-router';
import { ZodQueryEncoder } from '../helpers/query-encoder';
import { VariantSelector, VariantSelectorSchema } from '../helpers/sample-selector';
import { isSamplingStrategy, SamplingStrategy } from '../services/api';
import { Country } from '../services/api-types';

const queryEncoder = new ZodQueryEncoder(VariantSelectorSchema);

export interface ExploreUrl {
  country: Country;
  setCountry: (country: string) => void;
  samplingStrategy: SamplingStrategy;
  setSamplingStrategy: (samplingStrategy: SamplingStrategy) => void;
  variantSelector?: VariantSelector;
  focusKey: string;
}

export function useExploreUrl(): ExploreUrl | undefined {
  const history = useHistory();
  const location = useLocation();

  const baseRouteMatch = useRouteMatch<{ country: string; samplingStrategy: string }>(
    `/explore/:country/:samplingStrategy`
  );
  const variantRouteMatch = useRouteMatch<{
    country: string;
    samplingStrategy: string;
    variantSelector: string;
  }>(`/explore/:country/:samplingStrategy/variants/:variantSelector`);

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

  if (variantRouteMatch) {
    assert.strictEqual(baseRouteMatch.params.country, variantRouteMatch.params.country);
    assert.strictEqual(baseRouteMatch.params.samplingStrategy, variantRouteMatch.params.samplingStrategy);
  }

  return {
    country,
    setCountry,
    samplingStrategy,
    setSamplingStrategy,
    variantSelector,
    focusKey: `${country}-${samplingStrategy}-${encodedVariantSelector}`,
  };
}

export function getFocusPageLink({
  variantSelector,
  country,
  samplingStrategy,
  deepFocusPath = '',
}: {
  variantSelector: VariantSelector;
  country: Country;
  samplingStrategy: SamplingStrategy;
  deepFocusPath?: string;
}) {
  assert(!deepFocusPath || deepFocusPath.startsWith('/'));
  return (
    generatePath(`/explore/${country}/${samplingStrategy}/variants/:variantSelector`, {
      variantSelector: queryEncoder.encode(variantSelector).toString(),
    }) + deepFocusPath
  );
}
