import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  loginAs,
  resetDatabase,
  seedMinimalFixtures,
  TEST_PASSWORD,
} from '../test/helpers';
import { hashPassword } from '../lib/password';

async function seedAdminToken(): Promise<string> {
  const passwordHash = await hashPassword(TEST_PASSWORD);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.huntflow.app',
      name: 'Test Admin',
      role: 'PLATFORM_ADMIN',
      passwordHash,
      notificationPreferences: { create: {} },
    },
  });
  return loginAs(admin.email, 'PLATFORM_ADMIN');
}

describe('admin support inquiries', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('lists and updates inquiries for platform admin', async () => {
    const fx = await seedMinimalFixtures();
    const adminToken = await seedAdminToken();

    const inquiry = await prisma.supportInquiry.create({
      data: {
        name: 'Pat Support',
        email: 'pat@example.com',
        subject: 'Billing question',
        message: 'Can you help with my account?',
      },
    });

    const list = await getTestAgent()
      .get('/api/admin/support-inquiries')
      .set(authHeader(adminToken));
    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0].subject).toBe('Billing question');

    const detail = await getTestAgent()
      .get(`/api/admin/support-inquiries/${inquiry.id}`)
      .set(authHeader(adminToken));
    expect(detail.status).toBe(200);
    expect(detail.body.inquiry.message).toContain('help');

    const patched = await getTestAgent()
      .patch(`/api/admin/support-inquiries/${inquiry.id}`)
      .set(authHeader(adminToken))
      .send({ status: 'RESOLVED', adminNotes: 'Replied by email' });
    expect(patched.status).toBe(200);
    expect(patched.body.inquiry.status).toBe('RESOLVED');
    expect(patched.body.inquiry.adminNotes).toBe('Replied by email');

    const forbidden = await getTestAgent()
      .get('/api/admin/support-inquiries')
      .set(authHeader(fx.seeker.token));
    expect(forbidden.status).toBe(403);
  });
});
