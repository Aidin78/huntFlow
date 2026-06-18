import { expect, test } from '@playwright/test';

import { DEMO_SEEKER, loginViaUi } from './helpers/auth';

test('seeker can add tag on detail and filter list by tag with URL', async ({ page }) => {
  await loginViaUi(page, DEMO_SEEKER);
  await page.goto('/dashboard/seeker/applications');
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible({ timeout: 15_000 });

  const applicationHref = await page
    .getByRole('link', { name: 'Open' })
    .first()
    .getAttribute('href');
  expect(applicationHref).toBeTruthy();
  await page.goto(applicationHref!);

  const tagName = `E2E Tag ${Date.now()}`;
  await page.getByLabel('Add tag').fill(tagName);
  await page.getByRole('button', { name: 'Add tag' }).click();
  await expect(page.getByText(tagName)).toBeVisible({ timeout: 10_000 });

  await page.goto('/dashboard/seeker/applications');
  await page.getByRole('button', { name: tagName }).click();
  await expect(page).toHaveURL(new RegExp('tags='), { timeout: 10_000 });
  await expect(page.getByText(tagName).first()).toBeVisible();
});
