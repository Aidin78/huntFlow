import type { UserRole } from '@huntflow/db';
import { prisma } from '@huntflow/db';
import type { Agent } from 'supertest';
import request from 'supertest';

import { createApp } from '../app';
import { hashPassword } from '../lib/password';

export const TEST_PASSWORD = 'Test1234!';

export type TestUser = {
  id: string;
  email: string;
  role: UserRole;
  token: string;
};

export type MinimalFixtures = {
  company: { id: string; name: string };
  employer: TestUser;
  seeker: TestUser;
  listing: { id: string; title: string };
  application: { id: string };
};

let agent: Agent | null = null;

export function getTestAgent(): Agent {
  if (!agent) {
    agent = request(createApp());
  }
  return agent;
}

export async function resetDatabase(): Promise<void> {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  const names = tables
    .map((t) => t.tablename)
    .filter((name) => name !== '_prisma_migrations');

  if (names.length === 0) return;

  const quoted = names.map((n) => `"public"."${n}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE;`);
}

export async function loginAs(email: string, role: UserRole): Promise<string> {
  const res = await getTestAgent()
    .post('/api/auth/login')
    .send({ email, password: TEST_PASSWORD, role });

  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  }
  return res.body.token as string;
}

export async function seedMinimalFixtures(): Promise<MinimalFixtures> {
  const passwordHash = await hashPassword(TEST_PASSWORD);

  const company = await prisma.company.create({
    data: {
      name: 'Test Co',
      tagline: 'We hire for tests',
      about: 'A complete company profile used by API integration tests only.',
      locations: 'Remote',
    },
  });

  const employerUser = await prisma.user.create({
    data: {
      email: 'employer@test.huntflow.app',
      name: 'Test Employer',
      role: 'EMPLOYER',
      passwordHash,
      notificationPreferences: { create: {} },
      employerProfile: { create: { companyId: company.id } },
    },
  });

  const seekerUser = await prisma.user.create({
    data: {
      email: 'seeker@test.huntflow.app',
      name: 'Test Seeker',
      role: 'JOB_SEEKER',
      passwordHash,
      notificationPreferences: { create: {} },
    },
  });

  const listing = await prisma.jobListing.create({
    data: {
      title: 'Test Engineer',
      summary: 'Integration test role',
      city: 'Berlin',
      workArrangement: 'REMOTE',
      experienceLevel: 'MID',
      salaryText: '€60k',
      companyId: company.id,
      isActive: true,
      publishedAt: new Date(),
    },
  });

  const application = await prisma.jobApplication.create({
    data: {
      title: listing.title,
      status: 'APPLIED',
      appliedAt: new Date(),
      userId: seekerUser.id,
      companyId: company.id,
      jobListingId: listing.id,
    },
  });

  await prisma.applicationThread.create({
    data: { jobApplicationId: application.id },
  });

  const employerToken = await loginAs(employerUser.email, 'EMPLOYER');
  const seekerToken = await loginAs(seekerUser.email, 'JOB_SEEKER');

  return {
    company: { id: company.id, name: company.name },
    employer: {
      id: employerUser.id,
      email: employerUser.email,
      role: 'EMPLOYER',
      token: employerToken,
    },
    seeker: {
      id: seekerUser.id,
      email: seekerUser.email,
      role: 'JOB_SEEKER',
      token: seekerToken,
    },
    listing: { id: listing.id, title: listing.title },
    application: { id: application.id },
  };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
