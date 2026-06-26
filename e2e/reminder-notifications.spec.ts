import { expect, test } from '@playwright/test';

import { DEMO_SEEKER, loginViaUi } from './helpers/auth';

test('seeker sees bell alert for past-due reminder', async ({ page }) => {
  await loginViaUi(page, DEMO_SEEKER);
  await page.goto('/dashboard/seeker/applications');
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible({ timeout: 15_000 });

  const applicationHref = await page
    .getByRole('link', { name: 'Open' })
    .first()
    .getAttribute('href');
  expect(applicationHref).toBeTruthy();
  await page.goto(applicationHref!);

  const reminderTitle = `E2E Due Reminder ${Date.now()}`;
  await page.getByRole('button', { name: 'Add reminder' }).click();
  await page.getByLabel('Title', { exact: true }).fill(reminderTitle);

  const remindAtInput = page.locator('input[type="datetime-local"]').last();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(9, 0, 0, 0);
  const localValue = yesterday.toISOString().slice(0, 16);
  await remindAtInput.fill(localValue);

  await page.getByRole('button', { name: 'Save reminder' }).click();
  await expect(page.getByText(reminderTitle)).toBeVisible({ timeout: 10_000 });

  await page.goto('/dashboard/seeker');
  await page.getByRole('button', { name: /Notifications/i }).click();
  await expect(
    page.getByText(new RegExp(reminderTitle, 'i')).or(page.getByText(/Reminder:/i)).first(),
  ).toBeVisible({ timeout: 20_000 });
});
