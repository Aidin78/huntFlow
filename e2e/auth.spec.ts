import { expect, test } from '@playwright/test';

import { DEMO_EMPLOYER, loginViaUi } from './helpers/auth';

test('employer login lands on employer dashboard', async ({ page }) => {
  await loginViaUi(page, DEMO_EMPLOYER);

  await expect(page).toHaveURL(/\/dashboard\/employer/);
  await expect(page.getByRole('heading', { name: 'Employer overview' })).toBeVisible();
});
