import { expect, test } from '@playwright/test';
import { getRunnableChromiumExecutablePath } from './browserExecutable';

const expectedConsoleErrors = [
  /plotly-latest\.min\.js and plotly-latest\.js are NO LONGER the latest releases of plotly\.js/,
];

test.skip(
  !process.env.CI && !process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH && !getRunnableChromiumExecutablePath(),
  'No runnable local Chromium executable is available. Install browser system libraries or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.'
);

test('live SARS-CoV-2 preview supports the main explore-to-variant workflow', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/explore/Europe/AllSamples/Past6M');

  await expect(page.getByRole('heading', { name: /detect and analyze variants/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /^search$/i })).toBeVisible();

  await page.locator('.form-check-input').last().check();
  await page.getByPlaceholder('(B.1.1.529* | S:67V) & !C913T').fill('S:N501Y');
  await page.getByRole('button', { name: /^search$/i }).click();

  await expect(page).toHaveURL(/\/explore\/Europe\/AllSamples\/Past6M\/variants\?variantQuery=S%3AN501Y&/);
  await expect(page.getByText(/analyze single variant/i)).toBeVisible();
  await expect(page.getByText(/S:N501Y/).first()).toBeVisible();

  expect(
    consoleErrors.filter(error => !expectedConsoleErrors.some(expected => expected.test(error)))
  ).toEqual([]);
});
