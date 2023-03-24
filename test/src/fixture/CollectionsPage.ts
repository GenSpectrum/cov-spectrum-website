import { Page } from '@playwright/test';

export default class CollectionsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await this.page.locator('#right-nav-buttons').getByRole('link', { name: 'Collections' }).click();
  }

  async selectCollection(collectionName: string) {
    await this.page.getByRole('link', { name: collectionName }).click();
  }

  async switchToSequencesOverTimeTab() {
    await this.page.getByRole('tab', { name: 'Sequences over time' }).click();
  }

  async switchToMutationsTab() {
    await this.page.getByRole('tab', { name: 'Mutations' }).click();
  }

  getMutationsTableNameCell(mutation: string) {
    return this.page.getByRole('cell', { name: mutation, exact: true });
  }

  async switchToTableTab() {
    await this.page.getByRole('tab', { name: 'Table' }).click();
  }
}
