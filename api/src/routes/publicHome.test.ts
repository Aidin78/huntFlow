import { beforeEach, describe, expect, it } from 'vitest';

import { getTestAgent, resetDatabase, seedMinimalFixtures } from '../test/helpers';

describe('GET /api/public/home', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns stats and featured jobs without auth', async () => {
    await seedMinimalFixtures();

    const res = await getTestAgent().get('/api/public/home');

    expect(res.status).toBe(200);
    expect(res.body.stats.activeListings).toBeGreaterThanOrEqual(1);
    expect(res.body.stats.hiringCompanies).toBeGreaterThanOrEqual(1);
    expect(res.body.featuredJobs.length).toBeGreaterThanOrEqual(1);
    expect(res.body.featuredJobs[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      company: expect.any(String),
    });
  });

  it('respects limit query', async () => {
    await seedMinimalFixtures();

    const res = await getTestAgent().get('/api/public/home?limit=1');

    expect(res.status).toBe(200);
    expect(res.body.featuredJobs.length).toBeLessThanOrEqual(1);
  });
});
