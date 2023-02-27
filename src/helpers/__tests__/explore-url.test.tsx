import { act, renderHook } from '@testing-library/react';
import { useExploreUrl } from '../explore-url';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { FixedDateRangeSelector, SpecialDateRangeSelector } from '../../data/DateRangeSelector';
import { globalDateCache } from '../date-cache';
import dayjs from 'dayjs';
import { SamplingStrategy } from '../../data/SamplingStrategy';
import { AnalysisMode } from '../../data/AnalysisMode';
import { getLocationDisplay, LocationDisplay } from '../testing/LocationDisplay';

jest.mock('../../data/api');

describe('useExploreUrl', () => {
  test.each([
    ['/explore/CountryWithoutSpaces/AllSamples/Y2022', 'CountryWithoutSpaces'],
    ['/explore/CountryWithoutSpaces/AllSamples/Y2022/variants', 'CountryWithoutSpaces'],
    ['/explore/Country%20With%20Spaces/AllSamples/Y2022', 'Country With Spaces'],
  ])('should extract correct parameters from url %s', (url, expectedCountry) => {
    const result = renderHook(() => useExploreUrl(), {
      wrapper: memoryRouterWithCurrentLocation(url),
    }).result.current;

    expect(result).not.toBe(undefined);
    expect(result?.location?.country).toBe(expectedCountry);
    expect(result?.samplingStrategy).toBe('AllSamples');
    expect(result?.dateRange.getDateRange().dateFrom?.string).toBe('2022-01-03');
    expect(result?.dateRange.getDateRange().dateTo?.string).toBe('2023-01-01');
  });

  test.each([
    {
      originUrl: '/explore/CountryWithoutSpaces/AllSamples/Y2022',
      targetUrl: '/explore/Target%20Country%20With%20Spaces/AllSamples/Y2022',
      targetCountry: 'Target Country With Spaces',
    },
    {
      originUrl: '/explore/CountryWithoutSpaces/AllSamples/Y2022/variants',
      targetUrl: '/explore/Target%20Country%20With%20Spaces/AllSamples/Y2022/variants',
      targetCountry: 'Target Country With Spaces',
    },
    {
      originUrl: '/explore/CountryWithoutSpaces/AllSamples/Y2022',
      targetUrl: '/explore/TargetCountryWithoutSpaces/AllSamples/Y2022',
      targetCountry: 'TargetCountryWithoutSpaces',
    },
    {
      originUrl: '/explore/CountryWithoutSpaces/AllSamples/Y2022/variants',
      targetUrl: '/explore/TargetCountryWithoutSpaces/AllSamples/Y2022/variants',
      targetCountry: 'TargetCountryWithoutSpaces',
    },
    {
      originUrl: '/explore/Country%20With%20Spaces/AllSamples/Y2022',
      targetUrl: '/explore/Target%20Country%20With%20Spaces/AllSamples/Y2022',
      targetCountry: 'Target Country With Spaces',
    },
    {
      originUrl: '/explore/Country%20With%20Spaces/AllSamples/Y2022/variants',
      targetUrl: '/explore/Target%20Country%20With%20Spaces/AllSamples/Y2022/variants',
      targetCountry: 'Target Country With Spaces',
    },
    {
      originUrl: '/explore/Country%20With%20Spaces/AllSamples/Y2022',
      targetUrl: '/explore/TargetCountryWithoutSpaces/AllSamples/Y2022',
      targetCountry: 'TargetCountryWithoutSpaces',
    },
    {
      originUrl: '/explore/Country%20With%20Spaces/AllSamples/Y2022/variants',
      targetUrl: '/explore/TargetCountryWithoutSpaces/AllSamples/Y2022/variants',
      targetCountry: 'TargetCountryWithoutSpaces',
    },
  ])(
    'should navigate to $targetUrl from $originUrl when setting location to "$targetCountry"',
    ({ originUrl, targetUrl, targetCountry }) => {
      const result = renderHook(() => useExploreUrl(), {
        wrapper: memoryRouterWithCurrentLocation(originUrl),
      }).result.current;

      act(() => result?.setLocation({ country: targetCountry }));
      expect(getLocationDisplay()).toHaveTextContent(targetUrl);
    }
  );

  test.each([
    {
      originUrl: '/explore/Target%20Country%20With%20Spaces/AllSamples/Y2022',
      targetUrl: '/explore/Target%20Country%20With%20Spaces/Surveillance/Y2022',
      samplingStrategy: 'Surveillance',
    },
    {
      originUrl: '/explore/CountryWithoutSpaces/AllSamples/Y2022/variants',
      targetUrl: '/explore/CountryWithoutSpaces/Surveillance/Y2022/variants',
      samplingStrategy: 'Surveillance',
    },
    {
      originUrl: '/explore/Target%20Country%20With%20Spaces/Surveillance/Y2022',
      targetUrl: '/explore/Target%20Country%20With%20Spaces/AllSamples/Y2022',
      samplingStrategy: 'AllSamples',
    },
    {
      originUrl: '/explore/CountryWithoutSpaces/Surveillance/Y2022/variants',
      targetUrl: '/explore/CountryWithoutSpaces/AllSamples/Y2022/variants',
      samplingStrategy: 'AllSamples',
    },
  ])(
    'should navigate to $targetUrl from $originUrl when setting sampling strategy to "$samplingStrategy"',
    ({ originUrl, targetUrl, samplingStrategy }) => {
      const result = renderHook(() => useExploreUrl(), {
        wrapper: memoryRouterWithCurrentLocation(originUrl),
      }).result.current;

      act(() => result?.setSamplingStrategy(samplingStrategy as SamplingStrategy));
      expect(getLocationDisplay()).toHaveTextContent(targetUrl);
    }
  );

  test.each([
    {
      originUrl: '/explore/country/AllSamples/Y2022',
      targetUrl: '/explore/country/AllSamples/Y2021',
      targetDateRange: new SpecialDateRangeSelector('Y2021'),
    },
    {
      originUrl: '/explore/country/AllSamples/Y2022/variants',
      targetUrl: '/explore/country/AllSamples/Y2021/variants',
      targetDateRange: new SpecialDateRangeSelector('Y2021'),
    },
    {
      originUrl: '/explore/country/AllSamples/Y2022',
      targetUrl: '/explore/country/AllSamples/from%3D2022-08-03%26to%3D2023-02-26',
      targetDateRange: dateRange('2022-08-03', '2023-02-26'),
    },
    {
      originUrl: '/explore/country/AllSamples/Y2022/variants',
      targetUrl: '/explore/country/AllSamples/from%3D2022-08-03%26to%3D2023-02-26/variants',
      targetDateRange: dateRange('2022-08-03', '2023-02-26'),
    },
    {
      originUrl: '/explore/country/AllSamples/from%3D2022-08-03%26to%3D2023-02-26',
      targetUrl: '/explore/country/AllSamples/Past6M',
      targetDateRange: new SpecialDateRangeSelector('Past6M'),
    },
    {
      originUrl: '/explore/country/AllSamples/from%3D2022-08-03%26to%3D2023-02-26/variants',
      targetUrl: '/explore/country/AllSamples/Past6M/variants',
      targetDateRange: new SpecialDateRangeSelector('Past6M'),
    },
    {
      originUrl: '/explore/country/AllSamples/from%3D2022-08-03%26to%3D2023-02-26',
      targetUrl: '/explore/country/AllSamples/from%3D2022-05-12%26to%3D2023-07-01',
      targetDateRange: dateRange('2022-05-12', '2023-07-01'),
    },
    {
      originUrl: '/explore/country/AllSamples/from%3D2022-08-03%26to%3D2023-02-26/variants',
      targetUrl: '/explore/country/AllSamples/from%3D2022-05-12%26to%3D2023-07-01/variants',
      targetDateRange: dateRange('2022-05-12', '2023-07-01'),
    },
    {
      originUrl: '/explore/Country%20With%20Spaces/AllSamples/Y2022',
      targetUrl: '/explore/Country%20With%20Spaces/AllSamples/from%3D2022-08-03%26to%3D2023-02-26',
      targetDateRange: dateRange('2022-08-03', '2023-02-26'),
    },
  ])(
    'should navigate to $targetUrl from $originUrl when changing the date range',
    ({ originUrl, targetUrl, targetDateRange }) => {
      const result = renderHook(() => useExploreUrl(), {
        wrapper: memoryRouterWithCurrentLocation(originUrl),
      }).result.current;

      act(() => result?.setDateRange(targetDateRange));
      expect(getLocationDisplay()).toHaveTextContent(targetUrl);
    }
  );

  test.each([
    {
      originUrl: '/explore/country/AllSamples/Y2022/variants',
      targetUrl: '/explore/country/AllSamples/Y2022/variants?pangoLineage=B.1&',
      variants: [{ pangoLineage: 'B.1' }],
    },
    {
      originUrl: '/explore/Country%20With%20Spaces/AllSamples/Y2022/variants?pangoLineage=B.1&',
      targetUrl: '/explore/Country%20With%20Spaces/AllSamples/Y2022/variants?pangoLineage=XYZ&',
      variants: [{ pangoLineage: 'XYZ' }],
    },
  ])(
    'should navigate to $targetUrl from $originUrl when changing the variants',
    ({ originUrl, targetUrl, variants }) => {
      const result = renderHook(() => useExploreUrl(), {
        wrapper: memoryRouterWithCurrentLocation(originUrl),
      }).result.current;

      act(() => result?.setVariants(variants));
      expect(getLocationDisplay()).toHaveTextContent(targetUrl);
    }
  );

  test.each([
    {
      originUrl: '/explore/Country%20With%20Spaces/AllSamples/Y2022/variants',
      targetUrl: '/explore/Country%20With%20Spaces/AllSamples/Y2022/variants?analysisMode=CompareToBaseline&',
      analysisMode: 'CompareToBaseline',
    },
    {
      originUrl: '/explore/country/AllSamples/Y2022/variants?pangoLineage=B.1&',
      targetUrl: '/explore/country/AllSamples/Y2022/variants?pangoLineage=B.1&analysisMode=CompareEquals&',
      analysisMode: 'CompareEquals',
    },
    {
      originUrl: '/explore/country/AllSamples/Y2022/variants?analysisMode=CompareEquals&',
      targetUrl: '/explore/country/AllSamples/Y2022/variants?&',
      analysisMode: 'Single',
    },
    {
      originUrl: '/explore/country/AllSamples/Y2022/variants?analysisMode=CompareEquals&',
      targetUrl: '/explore/country/AllSamples/Y2022/variants?analysisMode=CompareToBaseline&',
      analysisMode: 'CompareToBaseline',
    },
  ])(
    'should navigate to $targetUrl from $originUrl when changing the analysis mode to "$analysisMode"',
    ({ originUrl, targetUrl, analysisMode }) => {
      const result = renderHook(() => useExploreUrl(), {
        wrapper: memoryRouterWithCurrentLocation(originUrl),
      }).result.current;

      act(() => result?.setAnalysisMode(analysisMode as AnalysisMode));
      expect(getLocationDisplay()).toHaveTextContent(targetUrl);
    }
  );
});

function memoryRouterWithCurrentLocation(location: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[location]}>
      {children}
      <LocationDisplay />
    </MemoryRouter>
  );
}

function dateRange(from: string, to: string) {
  return new FixedDateRangeSelector({
    dateFrom: globalDateCache.getDayUsingDayjs(dayjs(from)),
    dateTo: globalDateCache.getDayUsingDayjs(dayjs(to)),
  });
}
