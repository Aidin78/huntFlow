import { createHash } from 'crypto';

import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
  TEST_PASSWORD,
} from '../test/helpers';
import { resetRateLimitForTests } from '../lib/rateLimit';

vi.mock('../lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
  isResendConfigured: vi.fn().mockReturnValue(true),
  getNotificationFromEmail: vi.fn().mockReturnValue('huntFlow <test@example.com>'),
  getWebOrigin: vi.fn().mockReturnValue('http://localhost:3000'),
  absoluteAppUrl: vi.fn((path: string | null) =>
    path ? `http://localhost:3000${path}` : null,
  ),
}));

describe('password reset', () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimitForTests();
  });

  it('returns 204 for forgot-password even when email is unknown', async () => {
    const res = await getTestAgent()
      .post('/api/auth/forgot-password')
      .send({ email: 'missing@test.huntflow.app' });
    expect(res.status).toBe(204);
  });

  it('resets password with valid token', async () => {
    const registered = await getTestAgent().post('/api/auth/register').send({
      email: 'reset-me@test.huntflow.app',
      password: TEST_PASSWORD,
      role: 'JOB_SEEKER',
    });
    expect(registered.status).toBe(201);

    const token = 'test-reset-token-plain';
    await prisma.passwordResetToken.create({
      data: {
        userId: registered.body.user.id,
        tokenHash: createHash('sha256').update(token).digest('hex'),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const res = await getTestAgent()
      .post('/api/auth/reset-password')
      .send({ token, password: 'NewTest1234!' });
    expect(res.status).toBe(204);

    const login = await getTestAgent().post('/api/auth/login').send({
      email: 'reset-me@test.huntflow.app',
      password: 'NewTest1234!',
      role: 'JOB_SEEKER',
    });
    expect(login.status).toBe(200);
  });
});

describe('DELETE /api/auth/account', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('rejects wrong password', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .delete('/api/auth/account')
      .set(authHeader(fx.seeker.token))
      .send({ password: 'WrongPassword1!' });

    expect(res.status).toBe(401);
  });

  it('deletes seeker account', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .delete('/api/auth/account')
      .set(authHeader(fx.seeker.token))
      .send({ password: TEST_PASSWORD });

    expect(res.status).toBe(204);

    const user = await prisma.user.findUnique({ where: { id: fx.seeker.id } });
    expect(user).toBeNull();
  });
});
