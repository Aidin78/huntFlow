import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';

describe('PATCH /api/seeker/applications/:id/status', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('allows seeker to archive application', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .patch(`/api/seeker/applications/${fx.application.id}/status`)
      .set(authHeader(fx.seeker.token))
      .send({ status: 'ARCHIVED' });

    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('ARCHIVED');
    expect(res.body.event.to).toBe('ARCHIVED');
  });

  it('rejects seeker setting interview status', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .patch(`/api/seeker/applications/${fx.application.id}/status`)
      .set(authHeader(fx.seeker.token))
      .send({ status: 'INTERVIEW' });

    expect(res.status).toBe(400);
  });

  it('rejects employer on seeker status route', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .patch(`/api/seeker/applications/${fx.application.id}/status`)
      .set(authHeader(fx.employer.token))
      .send({ status: 'ARCHIVED' });

    expect(res.status).toBe(403);
  });
});
