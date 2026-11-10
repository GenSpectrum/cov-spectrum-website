import React from 'react';
import { render, screen } from '@testing-library/react';
import { WasteWaterStoryPage } from '../WasteWaterStoryPage';
import { MemoryRouter } from 'react-router';
import ResizeObserver from 'resize-observer-polyfill';
import { filterByDateRange, getMaxDateRange, useWasteWaterData } from '../WasteWaterSamplingSitesHooks';
import { useResizeDetector } from 'react-resize-detector';
import { getTestWasteWaterDataWithLocation } from '../testHelpers';

vi.mock('recharts', async importOriginal => {
  const OriginalModule = await importOriginal<typeof import('recharts')>();
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
vi.mock('react-resize-detector');
const useResizeDetectorMock = useResizeDetector as vi.Mock<ReturnType<typeof useResizeDetector>>;

vi.mock('../WasteWaterSamplingSitesHooks', () => ({
  useWasteWaterData: vi.fn(),
  filterByDateRange: vi.fn(),
  getMaxDateRange: vi.fn(),
}));

const useWasteWaterDataMock = useWasteWaterData as vi.Mock;
const filterByDateRangeMock = filterByDateRange as vi.Mock;
const getMaxDateRangeMock = getMaxDateRange as vi.Mock;

beforeEach(() => {
  vi.resetAllMocks();
  useResizeDetectorMock.mockReturnValue({ width: 500, ref: vi.fn() });

  // Setup default mocks
  filterByDateRangeMock.mockImplementation((data: any) => data || []);
  getMaxDateRangeMock.mockReturnValue({
    dateFrom: { string: '2021-01-01' },
    dateTo: { string: '2021-12-31' },
  });
});

describe('WasteWaterStoryPage', function () {
  it('should render the main page title', function () {
    useWasteWaterDataMock.mockReturnValue([]);

    render(
      <MemoryRouter>
        <WasteWaterStoryPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Wastewater in Switzerland')).toBeInTheDocument();
  });

  it('should render discontinued sites sections as collapsible', function () {
    const data = getTestWasteWaterDataWithLocation(
      ['2021-01-01', '2021-01-02'],
      ['variantName1'],
      ['test_legacylocation']
    );
    useWasteWaterDataMock.mockReturnValue(data);

    render(
      <MemoryRouter>
        <WasteWaterStoryPage />
      </MemoryRouter>
    );

    // Should show discontinued sections collapsed by default
    expect(screen.getByText('Locations discontinued since March 26th, 2024')).toBeInTheDocument();
    expect(screen.getByText('Locations discontinued since November 25th, 2024')).toBeInTheDocument();

    // Check that the sections start collapsed (arrow should be pointing right)
    const firstSection = screen.getByText('Locations discontinued since March 26th, 2024');
    expect(firstSection.textContent).toContain('▶');
  });
});
