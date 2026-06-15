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

  it('rejects seeker setting interview status on board application', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .patch(`/api/seeker/applications/${fx.application.id}/status`)
      .set(authHeader(fx.seeker.token))
      .send({ status: 'INTERVIEW' });

    expect(res.status).toBe(403);
  });

  it('allows seeker to set interview on manual application', async () => {
    const fx = await seedMinimalFixtures();

    const created = await getTestAgent()
      .post('/api/seeker/applications')
      .set(authHeader(fx.seeker.token))
      .send({ title: 'Manual Role', companyName: 'Side Co' });
    expect(created.status).toBe(201);

    const res = await getTestAgent()
      .patch(`/api/seeker/applications/${created.body.application.id}/status`)
      .set(authHeader(fx.seeker.token))
      .send({ status: 'INTERVIEW' });

    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('INTERVIEW');
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
