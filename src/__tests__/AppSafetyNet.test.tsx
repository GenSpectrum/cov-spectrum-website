import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import ResizeObserver from 'resize-observer-polyfill';
import { useResizeDetector } from 'react-resize-detector';
import { App } from '../App';
import { EmbedPage } from '../pages/EmbedPage';
import { fetchCaseCounts, fetchCollections } from '../data/api';
import {
  _fetchAggSamples,
  checkSiloAvailability,
  fetchDateCountSamples,
  fetchPangoLineageCountSamples,
} from '../data/api-lapis';
import { globalDateCache } from '../helpers/date-cache';
import { LocationDisplay, getLocationDisplay } from '../helpers/testing/LocationDisplay';

vi.mock('../data/api');
vi.mock('../data/api-lapis');
vi.mock('react-resize-detector');

window.ResizeObserver = ResizeObserver;

const useResizeDetectorMock = useResizeDetector as vi.Mock<ReturnType<typeof useResizeDetector>>;
const checkSiloAvailabilityMock = checkSiloAvailability as vi.Mock<ReturnType<typeof checkSiloAvailability>>;
const fetchDateCountSamplesMock = fetchDateCountSamples as vi.Mock<ReturnType<typeof fetchDateCountSamples>>;
const fetchPangoLineageCountSamplesMock = fetchPangoLineageCountSamples as vi.Mock<
  ReturnType<typeof fetchPangoLineageCountSamples>
>;
const fetchAggSamplesMock = _fetchAggSamples as vi.Mock<ReturnType<typeof _fetchAggSamples>>;
const fetchCaseCountsMock = fetchCaseCounts as vi.Mock<ReturnType<typeof fetchCaseCounts>>;
const fetchCollectionsMock = fetchCollections as vi.Mock<ReturnType<typeof fetchCollections>>;

function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DndProvider backend={TestBackend}>
        <App />
      </DndProvider>
      <LocationDisplay />
    </MemoryRouter>
  );
}

function renderEmbedAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <EmbedPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  (global.fetch as vi.Mock).mockClear();
  document.title = '';
  useResizeDetectorMock.mockReturnValue({ width: 1024, ref: vi.fn() });
  checkSiloAvailabilityMock.mockResolvedValue({ isAvailable: true });
  fetchDateCountSamplesMock.mockResolvedValue([
    { date: globalDateCache.getDay('2024-01-01'), count: 100 },
    { date: globalDateCache.getDay('2024-01-08'), count: 120 },
  ]);
  fetchPangoLineageCountSamplesMock.mockResolvedValue([{ pangoLineage: 'BA.2', count: 10 }]);
  fetchAggSamplesMock.mockResolvedValue([{ nextstrainClade: '22B', count: 10 } as any]);
  fetchCaseCountsMock.mockResolvedValue([
    {
      region: 'Europe',
      country: 'Switzerland',
      division: null,
      date: globalDateCache.getDay('2024-01-01'),
      age: null,
      sex: null,
      hospitalized: null,
      died: null,
      newCases: 10,
      newDeaths: 0,
    },
  ]);
  fetchCollectionsMock.mockResolvedValue([
    {
      id: 1,
      title: "Editor's choice",
      description: 'Variants used by smoke tests',
      maintainers: 'CoV-Spectrum team',
      email: 'test@example.com',
      variants: [],
    },
  ]);
});

describe('App safety net', () => {
  test('redirects from the root route to the default explore page and renders the landing workflow', async () => {
    renderAppAt('/');

    expect(await screen.findByRole('heading', { name: /detect and analyze variants/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(getLocationDisplay()).toHaveTextContent('/explore/Switzerland/AllSamples/Past6M');
    });
  });

  test('renders core static routes used by top-level navigation', async () => {
    const user = userEvent.setup();

    renderAppAt('/about');

    expect(await screen.findByRole('heading', { name: 'CoV-Spectrum' })).toBeInTheDocument();

    const storyLinks = screen.getAllByRole('link', { name: 'Stories' });
    await user.click(storyLinks[storyLinks.length - 1]);
    expect(await screen.findByRole('heading', { name: 'Wastewater in Switzerland' })).toBeInTheDocument();
    expect(getLocationDisplay()).toHaveTextContent('/stories');

    const collectionLinks = screen.getAllByRole('link', { name: 'Collections' });
    await user.click(collectionLinks[collectionLinks.length - 1]);
    expect(await screen.findByRole('heading', { name: 'Collections' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create a new collection/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /editor's choice/i })).toBeInTheDocument();
    expect(getLocationDisplay()).toHaveTextContent('/collections');
  });

  test('renders the maintenance page without normal navigation links when LAPIS is unavailable', async () => {
    checkSiloAvailabilityMock.mockResolvedValue({
      isAvailable: false,
      retryAfterInSeconds: 120,
    });

    renderAppAt('/about');

    expect(await screen.findByText(/our database \(LAPIS\) is currently unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/please try again in 2 minutes/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'CoV-Spectrum' })).not.toBeInTheDocument();
  });

  test('shows the advanced filters alert and can reset filters from an explore URL', async () => {
    const user = userEvent.setup();

    renderAppAt('/explore/Switzerland/AllSamples/Past6M?host=Human&nextcladeCoverageFrom=0.9&');

    expect(await screen.findByText(/advanced filters are active/i)).toBeInTheDocument();
    expect(screen.getByText(/selected hosts: Human/i)).toBeInTheDocument();
    expect(screen.getByText(/sequence quality: 0.9 ≤ coverage/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove filters/i }));

    await waitFor(() => {
      expect(screen.queryByText(/advanced filters are active/i)).not.toBeInTheDocument();
    });
    expect(getLocationDisplay()).toHaveTextContent('/explore/Switzerland/AllSamples/Past6M?');
  });

  test('normalizes an incomplete explore URL', async () => {
    renderAppAt('/explore/Europe');

    await waitFor(() => {
      expect(getLocationDisplay()).toHaveTextContent('/explore/Europe/AllSamples/Past6M');
    });
    expect(await screen.findByRole('heading', { name: /detect and analyze variants/i })).toBeInTheDocument();
  });

  test.each([
    ['/explore/Europe/AllSamples/Past6M/sequencing-coverage', /sequencing coverage/i],
    ['/explore/Europe/AllSamples/Past6M/variants?pangoLineage=BA.2&', /analyze single variant/i],
    ['/explore/Europe/AllSamples/Past6M/variants/international-comparison?pangoLineage=BA.2&', /BA\.2/i],
  ])('mounts deep route %s', async (path, visibleText) => {
    renderAppAt(path);

    expect(await screen.findByText(visibleText)).toBeInTheDocument();
    expect(getLocationDisplay()).toHaveTextContent(path);
  });

  test('submitting an advanced variant search moves from explore to the variant page with query state', async () => {
    const user = userEvent.setup();

    renderAppAt('/explore/Europe/AllSamples/Past6M');

    expect(await screen.findByRole('heading', { name: /detect and analyze variants/i })).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[checkboxes.length - 1]);
    await user.type(screen.getByPlaceholderText('(B.1.1.529* | S:67V) & !C913T'), 'S:N501Y');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(getLocationDisplay()).toHaveTextContent(
        '/explore/Europe/AllSamples/Past6M/variants?variantQuery=S%3AN501Y&'
      );
    });
    expect(await screen.findByText(/analyze single variant/i)).toBeInTheDocument();
  });

  test('header sampling strategy selector updates the explore URL', async () => {
    const user = userEvent.setup();

    renderAppAt('/explore/Europe/AllSamples/Past6M');

    expect(await screen.findByRole('heading', { name: /detect and analyze variants/i })).toBeInTheDocument();
    await user.selectOptions(document.querySelector('#samplingStrategySelect')!, 'Surveillance');

    await waitFor(() => {
      expect(getLocationDisplay()).toHaveTextContent('/explore/Europe/Surveillance/Past6M');
    });
  });

  test('header location selector updates the explore URL', async () => {
    const user = userEvent.setup();

    renderAppAt('/explore/Europe/AllSamples/Past6M');

    expect(await screen.findByRole('heading', { name: /detect and analyze variants/i })).toBeInTheDocument();
    const locationInput = screen.getByPlaceholderText('Europe');
    await user.click(locationInput);
    await user.clear(locationInput);
    await user.type(locationInput, 'Germany');
    await user.click(await screen.findByText('Germany'));

    await waitFor(() => {
      expect(getLocationDisplay()).toHaveTextContent('/explore/Germany/AllSamples/Past6M');
    });
  });

  test('advanced filters modal can apply sequence quality settings to the URL', async () => {
    const user = userEvent.setup();

    renderAppAt('/explore/Europe/AllSamples/Past6M');

    expect(await screen.findByRole('heading', { name: /detect and analyze variants/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /advanced/i }));
    expect(await screen.findByText('Sequence quality')).toBeInTheDocument();

    const numberInputs = screen.getAllByRole('spinbutton');
    await user.type(numberInputs[0], '100');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(getLocationDisplay()).toHaveTextContent(
        '/explore/Europe/AllSamples/Past6M?nextcladeQcOverallScoreFrom=100&'
      );
    });
    expect(await screen.findByText(/advanced filters are active/i)).toBeInTheDocument();
    expect(screen.getByText(/sequence quality: 100 ≤ overall score/i)).toBeInTheDocument();
  });

  test('collection overview handles an empty collection list', async () => {
    fetchCollectionsMock.mockResolvedValue([]);

    renderAppAt('/collections');

    expect(await screen.findByRole('heading', { name: 'Collections' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create a new collection/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /editor's choice/i })).not.toBeInTheDocument();
  });

  test('unsupported embed routes show the widget fallback instead of crashing', async () => {
    renderEmbedAt('/embed/not-a-widget');

    expect(await screen.findByText(/widget is unspecified or unsupported/i)).toBeInTheDocument();
  });

  test('representative mocked route does not issue raw fetch calls', async () => {
    renderAppAt('/explore/Europe/AllSamples/Past6M');

    expect(await screen.findByRole('heading', { name: /detect and analyze variants/i })).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
