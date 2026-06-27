import { test, expect } from '@playwright/test';

import { DEMO_ADMIN, loginViaUi } from './helpers/auth';

test('admin can view support inbox', async ({ page }) => {
  await loginViaUi(page, DEMO_ADMIN);

  await page.goto('/dashboard/admin/support');
  await expect(page.getByRole('heading', { name: 'Support inbox' })).toBeVisible();
});
