import { act, render, screen } from '@testing-library/react';
import { App } from '../App';
import { MemoryRouter } from 'react-router';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import ResizeObserver from 'resize-observer-polyfill';
import { useResizeDetector } from 'react-resize-detector';
import { checkSiloAvailability } from '../data/api-lapis';

vi.mock('../data/api');
vi.mock('../data/api-lapis');

window.ResizeObserver = ResizeObserver;
vi.mock('react-resize-detector');
const useResizeDetectorMock = useResizeDetector as vi.Mock<ReturnType<typeof useResizeDetector>>;

const checkSiloAvailabilityMock = checkSiloAvailability as vi.Mock<ReturnType<typeof checkSiloAvailability>>;

beforeEach(() => {
  vi.resetAllMocks();
});

describe('App', () => {
  test('should render', async () => {
    useResizeDetectorMock.mockReturnValue({ width: 500, ref: vi.fn() });
    checkSiloAvailabilityMock.mockResolvedValue({ isAvailable: true });

    await act(() => {
      render(
        <MemoryRouter initialEntries={['/about']}>
          <DndProvider backend={TestBackend}>
            <App />
          </DndProvider>
        </MemoryRouter>
      );
    });
    await act(() => {});

    expect(screen.getByRole('heading', { name: 'CoV-Spectrum' })).toBeInTheDocument();
  });

  test('should display maintenance box', async () => {
    useResizeDetectorMock.mockReturnValue({ width: 500, ref: vi.fn() });
    checkSiloAvailabilityMock.mockResolvedValue({ isAvailable: false, retryAfterInSeconds: 120 });

    await act(() => {
      render(
        <MemoryRouter initialEntries={['/about']}>
          <DndProvider backend={TestBackend}>
            <App />
          </DndProvider>
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Please try again in 2 minutes', { exact: false })).toBeInTheDocument();
  });
});
