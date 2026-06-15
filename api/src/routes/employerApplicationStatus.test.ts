import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';

describe('PATCH /api/employer/applications/:id/status', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('updates status, writes event, and notifies seeker', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .patch(`/api/employer/applications/${fx.application.id}/status`)
      .set(authHeader(fx.employer.token))
      .send({ status: 'INTERVIEW', note: 'Schedule a call this week.' });

    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('INTERVIEW');
    expect(res.body.event.to).toBe('INTERVIEW');

    const events = await prisma.jobApplicationStatusEvent.findMany({
      where: { jobApplicationId: fx.application.id },
      orderBy: { at: 'desc' },
    });
    expect(events[0]?.to).toBe('INTERVIEW');
    expect(events[0]?.note).toBe('Schedule a call this week.');

    const notifications = await prisma.notification.findMany({
      where: { recipientUserId: fx.seeker.id, type: 'STATUS_EVENT' },
    });
    expect(notifications.length).toBeGreaterThanOrEqual(1);
  });

  it('returns 404 for application outside employer company', async () => {
    const fx = await seedMinimalFixtures();

    const register = await getTestAgent().post('/api/auth/register').send({
      email: 'other-employer@test.huntflow.app',
      password: 'Test1234!',
      role: 'EMPLOYER',
    });

    const res = await getTestAgent()
      .patch(`/api/employer/applications/${fx.application.id}/status`)
      .set(authHeader(register.body.token))
      .send({ status: 'REJECTED' });

    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid status', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .patch(`/api/employer/applications/${fx.application.id}/status`)
      .set(authHeader(fx.employer.token))
      .send({ status: 'ARCHIVED' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when status unchanged', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .patch(`/api/employer/applications/${fx.application.id}/status`)
      .set(authHeader(fx.employer.token))
      .send({ status: 'APPLIED' });

    expect(res.status).toBe(400);
  });
});
