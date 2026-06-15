import { expect, test } from '@playwright/test';

import { DEMO_SEEKER, loginViaUi } from './helpers/auth';

test('seeker can add and track a manual application', async ({ page }) => {
  await loginViaUi(page, DEMO_SEEKER);
  await page.goto('/dashboard/seeker/applications');
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible({ timeout: 15_000 });

  await page.getByRole('link', { name: 'Add application' }).first().click();
  await expect(page.getByRole('heading', { name: 'Add application' })).toBeVisible();

  const uniqueTitle = `Manual QA ${Date.now()}`;
  await page.getByLabel('Company').fill('Off Platform Co');
  await page.getByLabel('Role title').fill(uniqueTitle);
  await page.getByRole('button', { name: 'Add application' }).click();

  await expect(page.getByRole('heading', { name: uniqueTitle })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Applied').first()).toBeVisible();

  await page.getByRole('button', { name: 'Interview' }).click();
  await expect(page.getByText('Interview').first()).toBeVisible({ timeout: 10_000 });

  await page.goto('/dashboard/seeker/applications');
  await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Manual').first()).toBeVisible();
});
