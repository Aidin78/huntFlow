import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';

describe('POST /api/seeker/applications', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates manual application with APPLIED status and event', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .post('/api/seeker/applications')
      .set(authHeader(fx.seeker.token))
      .send({
        title: 'Product Designer',
        companyName: 'Design Studio',
        appliedAt: '2025-06-01',
        notes: 'Found on LinkedIn',
        sourceUrl: 'https://example.com/jobs/designer',
      });

    expect(res.status).toBe(201);
    expect(res.body.application.status).toBe('APPLIED');
    expect(res.body.application.isManual).toBe(true);
    expect(res.body.application.company.name).toBe('Design Studio');

    const stored = await prisma.jobApplication.findUnique({
      where: { id: res.body.application.id },
      include: { statusEvents: true, links: true },
    });
    expect(stored?.jobListingId).toBeNull();
    expect(stored?.statusEvents[0]?.to).toBe('APPLIED');
    expect(stored?.statusEvents[0]?.note).toBe('Added manually');
    expect(stored?.links[0]?.url).toBe('https://example.com/jobs/designer');
  });

  it('returns 409 for duplicate title at same company', async () => {
    const fx = await seedMinimalFixtures();

    const body = { title: 'Analyst', companyName: 'Acme' };
    const first = await getTestAgent()
      .post('/api/seeker/applications')
      .set(authHeader(fx.seeker.token))
      .send(body);
    expect(first.status).toBe(201);

    const second = await getTestAgent()
      .post('/api/seeker/applications')
      .set(authHeader(fx.seeker.token))
      .send(body);

    expect(second.status).toBe(409);
    expect(second.body.error.message).toMatch(/already track/i);
  });

  it('uses disambiguated company when name is claimed by employer', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .post('/api/seeker/applications')
      .set(authHeader(fx.seeker.token))
      .send({
        title: 'QA Engineer',
        companyName: fx.company.name,
      });

    expect(res.status).toBe(201);
    expect(res.body.application.company.name).toBe(fx.company.name);

    const stored = await prisma.jobApplication.findUnique({
      where: { id: res.body.application.id },
      include: { company: true },
    });
    expect(stored?.company.name).toBe(`${fx.company.name} (personal tracking)`);
  });
});

describe('GET /api/employer/applications manual isolation', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('does not list manual applications for employer', async () => {
    const fx = await seedMinimalFixtures();

    const manual = await getTestAgent()
      .post('/api/seeker/applications')
      .set(authHeader(fx.seeker.token))
      .send({
        title: 'Hidden Role',
        companyName: fx.company.name,
      });
    expect(manual.status).toBe(201);

    const res = await getTestAgent()
      .get('/api/employer/applications')
      .set(authHeader(fx.employer.token));

    expect(res.status).toBe(200);
    const ids = res.body.items.map((i: { id: string }) => i.id);
    expect(ids).toContain(fx.application.id);
    expect(ids).not.toContain(manual.body.application.id);
  });
});
