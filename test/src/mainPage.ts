import { expect } from '@playwright/test';
import { covSpectrumTest } from './fixture';

covSpectrumTest(
  'Select a country, search without providing a variant and check that it affects 100% of the population',
  async ({ covSpectrumPage }) => {
    await covSpectrumPage.selectCountry('Germany');
    await covSpectrumPage.searchVariant();

    await expect(covSpectrumPage.page.getByText('100.00%').first()).toBeVisible();
  }
);
