import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WasteWaterStoryPage } from '../WasteWaterStoryPage';
import { MemoryRouter } from 'react-router-dom';
import ResizeObserver from 'resize-observer-polyfill';
import { useWasteWaterData } from '../WasteWaterSamplingSitesHooks';
import { useResizeDetector } from 'react-resize-detector';
import { getTestWasteWaterDataWithLocation } from '../testHelpers';

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

jest.mock('../WasteWaterSamplingSitesHooks');
const useWasteWaterDataMock = useWasteWaterData as jest.Mock;

// Mock the filterByDateRange and getMaxDateRange functions as well
jest.mock('../WasteWaterSamplingSitesHooks', () => ({
  useWasteWaterData: jest.fn(),
  filterByDateRange: jest.fn(),
  getMaxDateRange: jest.fn(),
}));

const { filterByDateRange, getMaxDateRange } = require('../WasteWaterSamplingSitesHooks');

beforeEach(() => {
  jest.resetAllMocks();
  useResizeDetectorMock.mockReturnValue({ width: 500, ref: { current: null } });

  // Setup default mocks
  filterByDateRange.mockImplementation((data: any) => data || []);
  getMaxDateRange.mockReturnValue({
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

  it('should expand discontinued section when clicked', function () {
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

    const firstSection = screen.getByText('Locations discontinued since March 26th, 2024');

    // Click to expand
    fireEvent.click(firstSection);

    // After clicking, arrow should point down
    expect(firstSection.textContent).toContain('▼');
  });

  it('should handle different date formats in discontinued sections', function () {
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

    // Both sections should render without errors, even with different date formats
    expect(screen.getByText('Locations discontinued since March 26th, 2024')).toBeInTheDocument();
    expect(screen.getByText('Locations discontinued since November 25th, 2024')).toBeInTheDocument();
  });
});
