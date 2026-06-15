import { expect, test } from '@playwright/test';

import { DEMO_EMPLOYER, DEMO_SEEKER, loginViaUi } from './helpers/auth';

test('employer status change is visible to seeker', async ({ page }) => {
  await loginViaUi(page, DEMO_EMPLOYER);
  await page.goto('/dashboard/employer/applications');
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible({ timeout: 15_000 });

  const applicationHref = await page
    .locator('a[href^="/dashboard/employer/applications/"]')
    .first()
    .getAttribute('href');
  expect(applicationHref).toBeTruthy();
  await page.goto(applicationHref!);

  await page.getByRole('button', { name: 'Interview' }).click();
  await expect(page.getByText('Interview').first()).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: 'Sign out' }).first().click();

  await loginViaUi(page, DEMO_SEEKER);
  await page.goto('/dashboard/seeker/applications');
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible({ timeout: 15_000 });

  const seekerHref = await page
    .locator('a[href^="/dashboard/seeker/applications/"]')
    .first()
    .getAttribute('href');
  expect(seekerHref).toBeTruthy();
  await page.goto(seekerHref!);

  await expect(page.getByText('Interview').first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Applied → Interview|Interview/i).first()).toBeVisible();
});
