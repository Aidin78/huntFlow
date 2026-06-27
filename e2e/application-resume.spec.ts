import { test, expect } from '@playwright/test';

import { DEMO_SEEKER, loginViaUi } from './helpers/auth';

test('apply modal shows resume section', async ({ page }) => {
  await loginViaUi(page, DEMO_SEEKER);

  await page.goto('/jobs');
  const applyButton = page.getByRole('button', { name: 'Apply with huntFlow' }).first();
  await expect(applyButton).toBeVisible({ timeout: 15_000 });
  await applyButton.click();

  await expect(page.getByRole('heading', { name: 'Apply to this role' })).toBeVisible();
  await expect(page.getByText('Resume', { exact: true })).toBeVisible();
});
