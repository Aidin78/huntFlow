import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';

describe('GET /api/employer/overview', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns stats matching seeded data', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .get('/api/employer/overview')
      .set(authHeader(fx.employer.token));

    expect(res.status).toBe(200);
    expect(res.body.stats.publishedPostings).toBe(1);
    expect(res.body.stats.totalApplications).toBe(1);
    expect(res.body.stats.awaitingReview).toBe(1);
    expect(res.body.recentPostings).toHaveLength(1);
    expect(res.body.recentApplications).toHaveLength(1);
    expect(res.body.recentApplications[0].applicant.email).toBe(fx.seeker.email);
  });

  it('returns empty overview when employer has no company', async () => {
    const register = await getTestAgent().post('/api/auth/register').send({
      email: 'no-company@test.huntflow.app',
      password: 'Test1234!',
      role: 'EMPLOYER',
    });

    const res = await getTestAgent()
      .get('/api/employer/overview')
      .set(authHeader(register.body.token));

    expect(res.status).toBe(200);
    expect(res.body.stats.totalApplications).toBe(0);
    expect(res.body.recentPostings).toEqual([]);
  });
});
