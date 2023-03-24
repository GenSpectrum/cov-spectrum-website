import { Page } from '@playwright/test';

export default class CovSpectrumPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async selectCountry(country: string) {
    await this.page.getByRole('button', { name: 'Open' }).click();
    await this.page.getByRole('option', { name: country }).click();
  }

  async searchVariant() {
    await this.page.getByRole('button', { name: 'Search' }).click();
  }
}
