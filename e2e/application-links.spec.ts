import { test, expect } from '@playwright/test';

import { DEMO_SEEKER, loginViaUi } from './helpers/auth';

test('seeker adds link on manual application', async ({ page }) => {
  await loginViaUi(page, DEMO_SEEKER);

  await page.goto('/dashboard/seeker/applications');
  await page.getByRole('link', { name: 'Add application' }).first().click();

  const uniqueTitle = `Link E2E ${Date.now()}`;
  await page.getByLabel('Company').fill('E2E Test Co');
  await page.getByLabel('Role title').fill(uniqueTitle);
  await page.getByRole('button', { name: 'Add application' }).click();

  await page.waitForURL(/\/dashboard\/seeker\/applications\//);
  await page.getByRole('button', { name: 'Add link' }).click();
  await page.getByLabel('URL').fill('https://example.com/portfolio');
  await page.getByRole('button', { name: 'Save link' }).click();

  await expect(page.getByText('https://example.com/portfolio')).toBeVisible();
});
