import { expect, test } from '@playwright/test';

import { DEMO_EMPLOYER, loginViaUi } from './helpers/auth';

test('employer can open the notification bell', async ({ page }) => {
  await loginViaUi(page, DEMO_EMPLOYER);

  const bell = page.getByRole('button', { name: /Notifications/i });
  await expect(bell).toBeVisible();

  await bell.click();
  await expect(page.getByText('Notifications', { exact: true })).toBeVisible();

  const badge = page.locator('button[aria-label*="unread"] span').first();
  if (await badge.isVisible()) {
    await expect(badge).toBeVisible();
  } else {
    await expect(page.getByText(/No notifications yet|New application|New message/i)).toBeVisible();
  }
});
