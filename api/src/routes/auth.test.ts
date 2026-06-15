import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  TEST_PASSWORD,
} from '../test/helpers';

describe('auth routes', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('registers a job seeker and creates notification preferences', async () => {
    const res = await getTestAgent().post('/api/auth/register').send({
      email: 'newseeker@test.huntflow.app',
      password: TEST_PASSWORD,
      name: 'New Seeker',
      role: 'JOB_SEEKER',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('newseeker@test.huntflow.app');

    const prefs = await prisma.userNotificationPreferences.findUnique({
      where: { userId: res.body.user.id },
    });
    expect(prefs).not.toBeNull();
    expect(prefs?.notifyNewMessage).toBe(true);
  });

  it('logs in with matching role', async () => {
    await getTestAgent().post('/api/auth/register').send({
      email: 'employer-auth@test.huntflow.app',
      password: TEST_PASSWORD,
      role: 'EMPLOYER',
    });

    const res = await getTestAgent().post('/api/auth/login').send({
      email: 'employer-auth@test.huntflow.app',
      password: TEST_PASSWORD,
      role: 'EMPLOYER',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects login when selected role does not match account', async () => {
    await getTestAgent().post('/api/auth/register').send({
      email: 'role-mismatch@test.huntflow.app',
      password: TEST_PASSWORD,
      role: 'JOB_SEEKER',
    });

    const res = await getTestAgent().post('/api/auth/login').send({
      email: 'role-mismatch@test.huntflow.app',
      password: TEST_PASSWORD,
      role: 'EMPLOYER',
    });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/notifications', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('requires authentication', async () => {
    const res = await getTestAgent().get('/api/notifications');
    expect(res.status).toBe(401);
  });
});
