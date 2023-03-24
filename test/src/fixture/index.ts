import { test } from '@playwright/test';
import CovSpectrumPage from './CovSpectrumPage';
import CollectionsPage from './CollectionsPage';

export const covSpectrumTest = test.extend<{
  covSpectrumPage: CovSpectrumPage;
  collectionsPage: CollectionsPage;
}>({
  covSpectrumPage: async ({ page }, use) => {
    const covSpectrumPage = new CovSpectrumPage(page);
    await covSpectrumPage.goto();
    await use(covSpectrumPage);
  },
  collectionsPage: async ({ page }, use) => {
    const collectionsPage = new CollectionsPage(page);
    await collectionsPage.goto();
    await use(collectionsPage);
  },
});
