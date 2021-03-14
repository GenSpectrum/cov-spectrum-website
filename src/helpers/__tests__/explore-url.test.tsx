import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SamplingStrategy } from '../../services/api';
import { ExploreUrl, useExploreUrl } from '../explore-url';
import { VariantSelector } from '../sample-selector';
import { pick } from 'lodash';

let container: HTMLDivElement | undefined;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  jest.restoreAllMocks();
  if (container) {
    unmountComponentAtNode(container);
    container.remove();
    container = undefined;
  }
});

describe('useExploreUrl', () => {
  const exampleVariantSelector: VariantSelector = {
    variant: { name: 'Test variant', mutations: ['ORF8:Q27*'] },
    matchPercentage: 0.7,
  };
  const exampleVariantSelectorEncoded = JSON.stringify(exampleVariantSelector);

  interface Case {
    label: string;
    initialUrl: string;
    finalUrl?: string; // defaults to initialUrl
    exploreUrl?: {
      country: string;
      samplingStrategy: SamplingStrategy;
      variantSelector?: VariantSelector;
    };
    warnings?: RegExp[];
  }
  const cases: Case[] = [
    {
      label: 'does nothing at root URL',
      initialUrl: '/',
    },
    {
      label: 'does nothing at non-explore URL',
      initialUrl: '/some-url',
    },
    {
      label: 'redirects home without country',
      initialUrl: '/explore/',
      finalUrl: '/',
      warnings: [/invalid URL/],
    },
    {
      label: 'accepts explore URL with no focused variant',
      initialUrl: '/explore/Germany/Surveillance',
      exploreUrl: {
        country: 'Germany',
        samplingStrategy: SamplingStrategy.Surveillance,
      },
    },
    {
      label: 'redirects from old URL (no focused variant, no trailing slash)',
      initialUrl: '/explore/Germany/variants',
      finalUrl: '/explore/Germany/AllSamples/variants',
      exploreUrl: {
        country: 'Germany',
        samplingStrategy: SamplingStrategy.AllSamples,
      },
      warnings: [/invalid samplingStrategy/],
    },
    {
      label: 'redirects from old URL (no focused variant, trailing slash)',
      initialUrl: '/explore/Germany/variants/',
      finalUrl: '/explore/Germany/AllSamples/variants/',
      exploreUrl: {
        country: 'Germany',
        samplingStrategy: SamplingStrategy.AllSamples,
      },
      warnings: [/invalid samplingStrategy/],
    },
    {
      label: 'redirects from old URL (focused variant)',
      initialUrl: `/explore/Germany/variants/json=${exampleVariantSelectorEncoded}`,
      finalUrl: `/explore/Germany/AllSamples/variants/json=${exampleVariantSelectorEncoded}`,
      exploreUrl: {
        country: 'Germany',
        samplingStrategy: SamplingStrategy.AllSamples,
        variantSelector: exampleVariantSelector,
      },
      warnings: [/invalid samplingStrategy/],
    },
    {
      label: 'redirects from old URL (focused variant, deep focus)',
      initialUrl: `/explore/Germany/variants/json=${exampleVariantSelectorEncoded}/deepExample`,
      finalUrl: `/explore/Germany/AllSamples/variants/json=${exampleVariantSelectorEncoded}/deepExample`,
      exploreUrl: {
        country: 'Germany',
        samplingStrategy: SamplingStrategy.AllSamples,
        variantSelector: exampleVariantSelector,
      },
      warnings: [/invalid samplingStrategy/],
    },
    {
      label: 'decodes variant',
      initialUrl: `/explore/Italy/Surveillance/variants/json=${exampleVariantSelectorEncoded}`,
      exploreUrl: {
        country: 'Italy',
        samplingStrategy: SamplingStrategy.Surveillance,
        variantSelector: exampleVariantSelector,
      },
    },
    {
      label: 'gives warning with invalid encoded variant',
      initialUrl: `/explore/Italy/Surveillance/variants/json=bla`,
      exploreUrl: {
        country: 'Italy',
        samplingStrategy: SamplingStrategy.Surveillance,
      },
      warnings: [/could not decode/],
    },
  ];

  for (const c of cases) {
    // eslint-disable-next-line jest/valid-title, no-loop-func
    test(c.label, () => {
      const warnings: unknown[] = [];
      for (const method of ['log', 'warn', 'error'] as const) {
        jest.spyOn(console, method).mockImplementation((...args) => {
          warnings.push(args[0]);
        });
      }

      let actualExploreUrl: ExploreUrl | undefined;
      let actualFinalUrl: string | undefined;
      let renderCount = 0;
      act(() => {
        render(
          <MemoryRouter initialEntries={[c.initialUrl]}>
            {React.createElement(() => {
              renderCount++;
              if (renderCount > 10) {
                jest.restoreAllMocks();
                console.log(warnings);
                throw new Error('reached max number of renders');
              }

              actualExploreUrl = useExploreUrl();
              actualFinalUrl = useLocation().pathname;

              return null;
            })}
          </MemoryRouter>,
          container!
        );
      });

      jest.restoreAllMocks();

      expect(actualFinalUrl).toEqual(c.finalUrl ?? c.initialUrl);

      const relevantKeys = ['country', 'samplingStrategy', 'variantSelector'] as const;
      expect(actualExploreUrl && pick(actualExploreUrl, relevantKeys)).toEqual(
        c.exploreUrl && pick(c.exploreUrl, relevantKeys)
      );

      if (warnings.length !== (c.warnings ?? []).length) {
        console.log(warnings);
      }
      expect(warnings.length).toEqual((c.warnings ?? []).length);
      for (const [i, expectedWarning] of (c.warnings ?? []).entries()) {
        expect(warnings[i]).toMatch(expectedWarning);
      }
    });
  }
});
