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

export async function loginViaUi(
  page: Page,
  {
    email,
    password = DEMO_PASSWORD,
    role,
  }: {
    email: string;
    password?: string;
    role: 'employer' | 'seeker';
  },
): Promise<void> {
  await page.goto(`/login?role=${role}`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  const roleLabel = role === 'employer' ? 'Employer' : 'Job seeker';
  await page.getByRole('button', { name: `Sign in as ${roleLabel}` }).click();
}
