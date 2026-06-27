import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  loginAs,
  resetDatabase,
  seedMinimalFixtures,
  TEST_PASSWORD,
} from '../test/helpers';
import { hashPassword } from '../lib/password';

describe('seeker application links', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates, lists, updates, and deletes links', async () => {
    const fx = await seedMinimalFixtures();

    const created = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/links`)
      .set(authHeader(fx.seeker.token))
      .send({ label: 'Portfolio', url: 'https://example.com/portfolio' });

    expect(created.status).toBe(201);
    expect(created.body.link.label).toBe('Portfolio');

    const list = await getTestAgent()
      .get(`/api/seeker/applications/${fx.application.id}/links`)
      .set(authHeader(fx.seeker.token));
    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);

    const linkId = created.body.link.id as string;
    const updated = await getTestAgent()
      .patch(`/api/seeker/applications/${fx.application.id}/links/${linkId}`)
      .set(authHeader(fx.seeker.token))
      .send({ url: 'https://example.com/work' });
    expect(updated.status).toBe(200);
    expect(updated.body.link.url).toBe('https://example.com/work');

    const deleted = await getTestAgent()
      .delete(`/api/seeker/applications/${fx.application.id}/links/${linkId}`)
      .set(authHeader(fx.seeker.token));
    expect(deleted.status).toBe(204);
  });

  it('upserts Job posting link on create', async () => {
    const fx = await seedMinimalFixtures();

    const first = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/links`)
      .set(authHeader(fx.seeker.token))
      .send({ label: 'Job posting', url: 'https://example.com/jobs/1' });
    expect(first.status).toBe(201);

    const second = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/links`)
      .set(authHeader(fx.seeker.token))
      .send({ label: 'Job posting', url: 'https://example.com/jobs/2' });
    expect(second.status).toBe(201);

    const links = await prisma.jobApplicationLink.findMany({
      where: { jobApplicationId: fx.application.id, label: 'Job posting' },
    });
    expect(links).toHaveLength(1);
    expect(links[0]?.url).toBe('https://example.com/jobs/2');
  });

  it('returns 404 for another users application', async () => {
    const fx = await seedMinimalFixtures();
    const passwordHash = await hashPassword(TEST_PASSWORD);
    const other = await prisma.user.create({
      data: {
        email: 'other-seeker@test.huntflow.app',
        role: 'JOB_SEEKER',
        passwordHash,
        notificationPreferences: { create: {} },
      },
    });
    const otherToken = await loginAs(other.email, 'JOB_SEEKER');

    const res = await getTestAgent()
      .get(`/api/seeker/applications/${fx.application.id}/links`)
      .set(authHeader(otherToken));
    expect(res.status).toBe(404);
  });
});
