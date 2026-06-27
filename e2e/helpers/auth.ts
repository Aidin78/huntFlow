import type { Page } from '@playwright/test';

export const DEMO_PASSWORD = 'Demo1234!';

export const DEMO_EMPLOYER = {
  email: 'employer@demo.huntflow.app',
  role: 'employer' as const,
};

export const DEMO_SEEKER = {
  email: 'alex.morgan@demo.huntflow.app',
  role: 'seeker' as const,
};

export const DEMO_ADMIN = {
  email: 'admin@demo.huntflow.app',
  role: 'admin' as const,
};

export async function loginViaUi(
  page: Page,
  {
    email,
    password = DEMO_PASSWORD,
    role,
  }: {
    email: string;
    password?: string;
    role: 'employer' | 'seeker' | 'admin';
  },
): Promise<void> {
  await page.goto(`/login?role=${role}`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  const roleLabel =
    role === 'employer' ? 'Employer' : role === 'admin' ? 'Platform admin' : 'Job seeker';
  await page.getByRole('button', { name: `Sign in as ${roleLabel}` }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 });
}
