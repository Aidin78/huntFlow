import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';

describe('employer notification preferences', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns default preferences', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .get('/api/employer/notification-preferences')
      .set(authHeader(fx.employer.token));

    expect(res.status).toBe(200);
    expect(res.body.notifyNewApplication).toBe(true);
    expect(res.body.notifyNewMessage).toBe(true);
  });

  it('persists preference updates', async () => {
    const fx = await seedMinimalFixtures();

    const patch = await getTestAgent()
      .patch('/api/employer/notification-preferences')
      .set(authHeader(fx.employer.token))
      .send({ notifyNewMessage: false });

    expect(patch.status).toBe(200);
    expect(patch.body.notifyNewMessage).toBe(false);

    const get = await getTestAgent()
      .get('/api/employer/notification-preferences')
      .set(authHeader(fx.employer.token));

    expect(get.body.notifyNewMessage).toBe(false);
  });
});
