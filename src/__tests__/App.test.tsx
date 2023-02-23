import { act, render, screen } from '@testing-library/react';
import { App } from '../App';
import { MemoryRouter } from 'react-router-dom';
import ResizeObserver from 'resize-observer-polyfill';
import { useResizeDetector } from 'react-resize-detector';

jest.mock('../data/api');
jest.mock('../data/api-lapis');

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');
const useResizeDetectorMock = useResizeDetector as jest.Mock<ReturnType<typeof useResizeDetector>>;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('App', () => {
  test('should render', async () => {
    useResizeDetectorMock.mockReturnValue({ width: 500, ref: { current: null } });

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
});
