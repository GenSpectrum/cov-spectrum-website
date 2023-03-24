import { expect } from '@playwright/test';
import { covSpectrumTest } from './fixture';

covSpectrumTest('Step through collections page', async ({ collectionsPage }) => {
  await collectionsPage.selectCollection("Editor's choice");

  await collectionsPage.switchToSequencesOverTimeTab();
  await expect(
    collectionsPage.page
      .getByText(/^Proportion of all samples from \d{4}-\d{1,2}-\d{1,2} to \d{4}-\d{1,2}-\d{1,2}$/)
      .first()
  ).toBeVisible();

  await collectionsPage.switchToMutationsTab();
  await expect(collectionsPage.getMutationsTableNameCell('XBB*')).toBeVisible();
  await expect(collectionsPage.page.getByRole('cell', { name: '>90%' })).toBeVisible();

  await collectionsPage.switchToTableTab();
  await expect(collectionsPage.getMutationsTableNameCell('XBB*')).toBeVisible();
  await expect(collectionsPage.page.getByText('Number sequences')).toBeVisible();
});
