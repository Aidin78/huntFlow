import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
  TEST_PASSWORD,
} from '../test/helpers';

describe('seeker application schedule', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates interview on own application', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/interviews`)
      .set(authHeader(fx.seeker.token))
      .send({
        title: 'Tech screen',
        scheduledAt: '2026-07-01T14:00:00.000Z',
        durationMinutes: 45,
        location: 'Zoom',
      });

    expect(res.status).toBe(201);
    expect(res.body.interview.title).toBe('Tech screen');
    expect(res.body.interview.applicationId).toBe(fx.application.id);
  });

  it('returns 404 when posting interview on another users application', async () => {
    const fx = await seedMinimalFixtures();

    const otherSeeker = await getTestAgent().post('/api/auth/register').send({
      email: 'other-seeker@test.huntflow.app',
      password: TEST_PASSWORD,
      role: 'JOB_SEEKER',
    });

    const res = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/interviews`)
      .set(authHeader(otherSeeker.body.token))
      .send({
        title: 'Should fail',
        scheduledAt: '2026-07-01T14:00:00.000Z',
      });

    expect(res.status).toBe(404);
  });

  it('marks reminder as DONE', async () => {
    const fx = await seedMinimalFixtures();

    const created = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/reminders`)
      .set(authHeader(fx.seeker.token))
      .send({
        title: 'Follow up',
        remindAt: '2026-07-02T09:00:00.000Z',
      });
    expect(created.status).toBe(201);

    const res = await getTestAgent()
      .patch(
        `/api/seeker/applications/${fx.application.id}/reminders/${created.body.reminder.id}`,
      )
      .set(authHeader(fx.seeker.token))
      .send({ status: 'DONE' });

    expect(res.status).toBe(200);
    expect(res.body.reminder.status).toBe('DONE');

    const stored = await prisma.reminder.findUnique({
      where: { id: created.body.reminder.id },
    });
    expect(stored?.status).toBe('DONE');
  });

  it('returns merged upcoming items', async () => {
    const fx = await seedMinimalFixtures();

    const reminderAt = new Date();
    reminderAt.setDate(reminderAt.getDate() + 3);
    reminderAt.setHours(9, 0, 0, 0);

    const interviewAt = new Date();
    interviewAt.setDate(interviewAt.getDate() + 7);
    interviewAt.setHours(14, 0, 0, 0);

    await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/interviews`)
      .set(authHeader(fx.seeker.token))
      .send({
        title: 'HR call',
        scheduledAt: interviewAt.toISOString(),
      });

    await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/reminders`)
      .set(authHeader(fx.seeker.token))
      .send({
        title: 'Send thank-you',
        remindAt: reminderAt.toISOString(),
      });

    const res = await getTestAgent()
      .get('/api/seeker/upcoming')
      .set(authHeader(fx.seeker.token));

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(2);
    expect(res.body.items[0].kind).toBe('reminder');
    expect(res.body.items.some((i: { kind: string }) => i.kind === 'interview')).toBe(true);
  });

  it('rejects employer on seeker interview routes', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .get(`/api/seeker/applications/${fx.application.id}/interviews`)
      .set(authHeader(fx.employer.token));

    expect(res.status).toBe(403);
  });
});
