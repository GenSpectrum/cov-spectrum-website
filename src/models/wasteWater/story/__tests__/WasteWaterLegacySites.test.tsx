import ResizeObserver from 'resize-observer-polyfill';
import { filterByDateRange, getMaxDateRange, useWasteWaterData } from '../WasteWaterSamplingSitesHooks';
import { render, screen } from '@testing-library/react';
import { WasteWaterLegacySites } from '../WasteWaterLegacySites';
import { useResizeDetector } from 'react-resize-detector';
import { globalDateCache } from '../../../../helpers/date-cache';
import { getTestWasteWaterDataWithLocation } from '../testHelper';
import { MemoryRouter } from 'react-router-dom';

jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');
const useResizeDetectorMock = useResizeDetector as jest.Mock<ReturnType<typeof useResizeDetector>>;

beforeEach(() => {
  jest.resetAllMocks();
});

jest.mock('../WasteWaterSamplingSitesHooks');
const useWasteWaterDataMock = useWasteWaterData as jest.Mock;
const filterByDateRangeMock = filterByDateRange as jest.Mock;
const minMaxDateMock = getMaxDateRange as jest.Mock;

describe('WasteWaterLegacySites', function () {
  it('should display loader when no data is provided', function () {
    useWasteWaterDataMock.mockReturnValue(undefined);

    render(
      <MemoryRouter>
        <WasteWaterLegacySites />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display Widgets for only legacy locations', function () {
    useResizeDetectorMock.mockReturnValue({ width: 500, ref: { current: null } });

    const data = getTestWasteWaterDataWithLocation(
      ['2021-01-01', '2021-01-02', '2021-01-03', '2021-01-04'],
      ['variantName1'],
      ['location1', 'location2', 'test_legacylocation']
    );

    useWasteWaterDataMock.mockReturnValue(data);
    filterByDateRangeMock.mockReturnValue(data);
    minMaxDateMock.mockReturnValue({
      dateFrom: globalDateCache.getDay('2021-01-01'),
      dateTo: globalDateCache.getDay('2021-01-04'),
    });

    render(
      <MemoryRouter>
        <WasteWaterLegacySites />
      </MemoryRouter>
    );

    expect(screen.getByText('Past 6 months')).toBeInTheDocument();
    expect(() => screen.getByText('location1')).toThrow();
    expect(() => screen.getByText('location2')).toThrow();
    expect(screen.getByText('test_legacylocation')).toBeInTheDocument();
  });
});
