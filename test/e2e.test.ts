// Starting point for end to end tests

import puppeteer from 'puppeteer';

describe('Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  it('contains the welcome text', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#logo-and-gsid');
    const text = await page.$eval('#logo-and-gsid', (e: { textContent: any }) => e.textContent);
    expect(text).toContain('Edit src/App.js and save to reload.');
  });
});
