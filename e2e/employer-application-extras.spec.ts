import { test, expect } from '@playwright/test';

import { DEMO_EMPLOYER, loginViaUi } from './helpers/auth';

test('employer application detail shows application tab', async ({ page }) => {
  await loginViaUi(page, DEMO_EMPLOYER);

  await page.goto('/dashboard/employer/applications');
  const firstApp = page.locator('a[href*="/dashboard/employer/applications/"]').first();
  await expect(firstApp).toBeVisible({ timeout: 15_000 });
  await firstApp.click();

  await page.getByRole('tab', { name: 'Application' }).click();
  await expect(page.getByText('Application details')).toBeVisible();
});
