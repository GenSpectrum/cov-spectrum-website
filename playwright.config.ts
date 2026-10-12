import { defineConfig, devices } from '@playwright/test';
import { getRunnableChromiumExecutablePath } from './test/e2e/browserExecutable';

const port = process.env.PORT ?? '3100';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const chromiumExecutablePath = getRunnableChromiumExecutablePath();

export default defineConfig({
  testDir: './test/e2e',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      `HOST=127.0.0.1 PORT=${port} BROWSER=none ` +
      'REACT_APP_SERVER_HOST=https://cov-spectrum.org/api/v2 ' +
      'REACT_APP_LAPIS_HOST=https://lapis.cov-spectrum.org/open/v2 ' +
      `REACT_APP_WEBSITE_HOST=${baseURL} ` +
      'REACT_APP_PPRETTY_HOST=https://cov-spectrum.org/api/ppretty ' +
      `npm start -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {},
      },
    },
  ],
});
