import { act, renderHook, screen } from '@testing-library/react';
import { useExploreUrl } from '../explore-url';
import { MemoryRouter, useLocation } from 'react-router';
import { ReactNode } from 'react';

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
});

function memoryRouterWithCurrentLocation(location: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[location]}>
      {children}
      <LocationDisplay />
    </MemoryRouter>
  );
}

const LOCATION_DISPLAY_ID = 'location-display';

function LocationDisplay() {
  const currentLocation = useLocation();
  return <div data-testid={LOCATION_DISPLAY_ID}>{currentLocation.pathname + currentLocation.search}</div>;
}

function getLocationDisplay() {
  return screen.getByTestId(LOCATION_DISPLAY_ID);
}
