# Tests

We currently have app smoke tests, snapshot tests for the more-or-less pure React components (especially the charts), and unit tests for the algorithmically more complex parts. The tests are stored in `__tests__` folders and have the file ending `.test.ts(x)` or `.tests.ts`.

## App smoke tests

`src/__tests__/AppSafetyNet.test.tsx` contains high-value app smoke tests intended to protect framework and dependency migrations. These tests render the real `App` with mocked API data and cover:

- redirecting from `/` to the default explore route;
- top-level navigation between About, Stories, and Collections;
- LAPIS maintenance-mode rendering;
- the advanced-filter alert and reset flow on an explore URL.
- incomplete explore URL normalization;
- representative deep routes for sequencing coverage, single-variant analysis, and international comparison;
- explore-page workflows that update URL state, including advanced variant search, sampling strategy changes, location changes, and advanced filter changes;
- empty collection-list rendering;
- unsupported embed fallback rendering;
- guarding representative app routes against accidental raw `fetch` calls outside the typed API mocks.

When replacing the build/test framework, keep these tests passing before doing larger UI dependency migrations.

## Browser smoke tests

`npm run test:e2e:live` runs a narrow Playwright smoke test against the live CoV-Spectrum backend and live SARS-CoV-2 LAPIS. It starts or reuses a preview on port `3100`, then verifies the main explore-to-variant workflow.

On this Ubuntu 26.04 server, Playwright's managed Chromium install is currently unsupported. The test uses a runnable system Chromium, the cached Puppeteer Chrome, or `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when available, and otherwise skips with an explicit message.

For Vite production-preview checks, set the live `REACT_APP_*` env vars before running `npm run build`; Vite compiles those values into the static bundle. Then run `npm run preview -- --port 3100` and `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npm run test:e2e:live`.

## Console output in tests

`src/setupTests.ts` suppresses known noisy React/library warnings, such as `react-test-renderer` deprecation warnings and expected `act(...)` noise from legacy tests. Unexpected `console.error` and `console.warn` output is still printed. If a new warning appears, prefer fixing the test or component before adding it to the allowlist.

The migration keeps a loose `vi.Mock` compatibility alias in `src/vite-env.d.ts` for existing Jest-style mock casts. Prefer `vi.mocked(...)` in new tests when it reads cleanly.

## Snapshot tests

Snapshot testing is a regression test technique which compares the output of the current code with the output of a previous version. We use `react-test-renderer` with Vitest to render React components and store the snapshots in `__tests__/__snapshots__` folders. The purpose of the tests is to help us identify the components impacted by a change.

When changing a component, a new snapshot needs to be created. This can be done with `npm run test -- --update`. Please read the [Vitest snapshot documentation](https://vitest.dev/guide/snapshot.html) for further information.

For snapshot tests to work, the tested component needs to be deterministic, i.e., the rendered output must always be the same given the same input. This is not the case for all the libraries we use. To mitigate the problem, we have to determine the non-deterministic parts of the output (e.g., this could be randomly generated CSS class names) and mask them. See [`snapshot-tests-masking.ts`](../src/helpers/testing/snapshot-tests-masking.ts).

The tests are run headlessly, but some components require information about the view. For example, they observe the window width through `useResizeDetector()`. We have to mock it.
