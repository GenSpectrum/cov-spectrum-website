import { act, render, screen } from '@testing-library/react';
import { App } from '../App';
import { MemoryRouter } from 'react-router-dom';
import ResizeObserver from 'resize-observer-polyfill';
import { useResizeDetector } from 'react-resize-detector';
import { checkSiloAvailability } from '../data/api-lapis';

jest.mock('../data/api');
jest.mock('../data/api-lapis');

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');
const useResizeDetectorMock = useResizeDetector as jest.Mock<ReturnType<typeof useResizeDetector>>;

const checkSiloAvailabilityMock = checkSiloAvailability as jest.Mock<
  ReturnType<typeof checkSiloAvailability>
>;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('App', () => {
  test('should render', async () => {
    useResizeDetectorMock.mockReturnValue({ width: 500, ref: { current: null } });
    checkSiloAvailabilityMock.mockResolvedValue({ isAvailable: true });

    await act(() => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
    });
    await act(() => {});

    expect(screen.getByText('CoV-Spectrum')).toBeInTheDocument();
  });

  test('should display maintenance box', async () => {
    useResizeDetectorMock.mockReturnValue({ width: 500, ref: { current: null } });
    checkSiloAvailabilityMock.mockResolvedValue({ isAvailable: false, retryAfterInSeconds: 120 });

    await act(() => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Please try again in 2 minutes', { exact: false })).toBeInTheDocument();
  });
});
