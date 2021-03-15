import assert from 'assert';
import { useEffect, useMemo } from 'react';
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

  if (!baseRouteMatch) {
    return undefined;
  }

  if (!samplingStrategy || !isSamplingStrategy(samplingStrategy)) {
    console.error('invalid samplingStrategy in URL', samplingStrategy);
    // The useEffect above will attempt to recover from this
    return undefined;
  }

  if (variantRouteMatch) {
    assert.strictEqual(baseRouteMatch.params.country, variantRouteMatch.params.country);
    assert.strictEqual(baseRouteMatch.params.samplingStrategy, variantRouteMatch.params.samplingStrategy);
  }

  const country = baseRouteMatch.params.country;

  const setCountry = (newCountry: string) => {
    const oldPrefix = `/explore/${country}`;
    assert(location.pathname.startsWith(oldPrefix));
    const suffix = location.pathname.slice(oldPrefix.length);
    history.push(`/explore/${newCountry}${suffix}`);
  };

  const setSamplingStrategy = (newSamplingStrategy: SamplingStrategy) => {
    const oldPrefix = `/explore/${country}/${samplingStrategy}`;
    assert(location.pathname.startsWith(oldPrefix));
    const suffix = location.pathname.slice(oldPrefix.length);
    history.push(`/explore/${country}/${newSamplingStrategy}${suffix}`);
  };

  return {
    country,
    setCountry,
    samplingStrategy,
    setSamplingStrategy,
    variantSelector,
    focusKey: `${country}-${samplingStrategy}-${variantSelector}`,
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
  return (
    generatePath(`/explore/${country}/${samplingStrategy}/variants/:variantSelector`, {
      variantSelector: queryEncoder.encode(variantSelector).toString(),
    }) + deepFocusPath
  );
}
