import { expect, test } from '@playwright/test';

import { DEMO_EMPLOYER, DEMO_SEEKER, loginViaUi } from './helpers/auth';

test('seeker message creates employer notification', async ({ page }) => {
  await loginViaUi(page, DEMO_SEEKER);
  await expect(page).toHaveURL(/\/dashboard\/seeker/);

  await page.goto('/dashboard/seeker/applications');
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible({
    timeout: 15_000,
  });

  const applicationHref = await page
    .locator('a[href^="/dashboard/seeker/applications/"]')
    .first()
    .getAttribute('href');
  expect(applicationHref).toBeTruthy();
  await page.goto(`${applicationHref}?tab=messages`);

  await expect(page.getByRole('tab', { name: 'Messages' })).toHaveAttribute('aria-selected', 'true');

  const message = `E2E message ${Date.now()}`;
  await page.getByLabel('Message').fill(message);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText(message)).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Sign out' }).first().click();

  await loginViaUi(page, DEMO_EMPLOYER);
  await expect(page).toHaveURL(/\/dashboard\/employer/);

  const bell = page.getByRole('button', { name: /Notifications/i });
  await expect(bell).toBeVisible();
  await bell.click();

  await expect(page.getByText(/New message|Alex Morgan/i).first()).toBeVisible({
    timeout: 15_000,
  });
});
