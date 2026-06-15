import { expect, test } from '@playwright/test';

import { DEMO_SEEKER, loginViaUi } from './helpers/auth';

test('seeker can add interview and reminder and see upcoming on dashboard', async ({ page }) => {
  await loginViaUi(page, DEMO_SEEKER);
  await page.goto('/dashboard/seeker/applications');
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible({ timeout: 15_000 });

  const applicationHref = await page
    .getByRole('link', { name: 'Open' })
    .first()
    .getAttribute('href');
  expect(applicationHref).toBeTruthy();
  await page.goto(applicationHref!);

  const interviewTitle = `E2E Interview ${Date.now()}`;
  await page.getByRole('button', { name: 'Add interview' }).click();
  await page.getByLabel('Title', { exact: true }).fill(interviewTitle);
  await page.getByRole('button', { name: 'Save interview' }).click();
  await expect(page.getByText(interviewTitle)).toBeVisible({ timeout: 10_000 });

  const reminderTitle = `E2E Reminder ${Date.now()}`;
  await page.getByRole('button', { name: 'Add reminder' }).click();
  await page.getByLabel('Title', { exact: true }).fill(reminderTitle);
  await page.getByRole('button', { name: 'Save reminder' }).click();
  await expect(page.getByText(reminderTitle)).toBeVisible({ timeout: 10_000 });

  await page.goto('/dashboard/seeker');
  await expect(page.getByRole('heading', { name: 'Upcoming' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(interviewTitle).or(page.getByText(reminderTitle)).first()).toBeVisible();
});
