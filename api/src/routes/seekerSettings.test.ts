import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';

describe('seeker notification preferences', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns default preferences for seeker', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .get('/api/seeker/notification-preferences')
      .set(authHeader(fx.seeker.token));

    expect(res.status).toBe(200);
    expect(res.body.notifyNewMessage).toBe(true);
    expect(res.body.notifyStatusEvent).toBe(true);
    expect(res.body.notifyInterviewReminder).toBe(true);
  });

  it('persists seeker preference updates', async () => {
    const fx = await seedMinimalFixtures();

    const patch = await getTestAgent()
      .patch('/api/seeker/notification-preferences')
      .set(authHeader(fx.seeker.token))
      .send({ notifyInterviewReminder: false });

    expect(patch.status).toBe(200);
    expect(patch.body.notifyInterviewReminder).toBe(false);
  });

  it('rejects employer on seeker preferences route', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .get('/api/seeker/notification-preferences')
      .set(authHeader(fx.employer.token));

    expect(res.status).toBe(403);
  });

  it('ignores employer-only preference fields on patch', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .patch('/api/seeker/notification-preferences')
      .set(authHeader(fx.seeker.token))
      .send({ notifyNewApplication: false, notifyNewMessage: false });

    expect(res.status).toBe(200);
    expect(res.body.notifyNewMessage).toBe(false);
    expect(res.body.notifyNewApplication).toBe(true);
  });
});
