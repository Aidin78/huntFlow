import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
  TEST_PASSWORD,
} from '../test/helpers';

describe('seeker tags', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates and lists user tags', async () => {
    const fx = await seedMinimalFixtures();

    const created = await getTestAgent()
      .post('/api/seeker/tags')
      .set(authHeader(fx.seeker.token))
      .send({ name: 'Remote', color: '#2563eb' });

    expect(created.status).toBe(201);
    expect(created.body.tag.name).toBe('Remote');

    const list = await getTestAgent().get('/api/seeker/tags').set(authHeader(fx.seeker.token));
    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0].usageCount).toBe(0);
  });

  it('returns 409 for duplicate tag name', async () => {
    const fx = await seedMinimalFixtures();

    await getTestAgent()
      .post('/api/seeker/tags')
      .set(authHeader(fx.seeker.token))
      .send({ name: 'Priority' });

    const dup = await getTestAgent()
      .post('/api/seeker/tags')
      .set(authHeader(fx.seeker.token))
      .send({ name: 'Priority' });

    expect(dup.status).toBe(409);
  });

  it('attaches tag to own application by name', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/tags`)
      .set(authHeader(fx.seeker.token))
      .send({ name: 'Referral', color: '#0d9488' });

    expect(res.status).toBe(201);
    expect(res.body.tag.name).toBe('Referral');

    const list = await getTestAgent()
      .get(`/api/seeker/applications/${fx.application.id}/tags`)
      .set(authHeader(fx.seeker.token));

    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);
  });

  it('cannot attach another users tag', async () => {
    const fx = await seedMinimalFixtures();

    const otherSeeker = await getTestAgent().post('/api/auth/register').send({
      email: 'other-tags@test.huntflow.app',
      password: TEST_PASSWORD,
      role: 'JOB_SEEKER',
    });

    const foreignTag = await getTestAgent()
      .post('/api/seeker/tags')
      .set(authHeader(otherSeeker.body.token))
      .send({ name: 'Foreign' });

    const res = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/tags`)
      .set(authHeader(fx.seeker.token))
      .send({ tagId: foreignTag.body.tag.id });

    expect(res.status).toBe(403);
  });

  it('replaces application tags in bulk', async () => {
    const fx = await seedMinimalFixtures();

    const tagA = await getTestAgent()
      .post('/api/seeker/tags')
      .set(authHeader(fx.seeker.token))
      .send({ name: 'A' });
    const tagB = await getTestAgent()
      .post('/api/seeker/tags')
      .set(authHeader(fx.seeker.token))
      .send({ name: 'B' });

    await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/tags`)
      .set(authHeader(fx.seeker.token))
      .send({ tagId: tagA.body.tag.id });

    const replaced = await getTestAgent()
      .put(`/api/seeker/applications/${fx.application.id}/tags`)
      .set(authHeader(fx.seeker.token))
      .send({ tagIds: [tagB.body.tag.id] });

    expect(replaced.status).toBe(200);
    expect(replaced.body.items).toHaveLength(1);
    expect(replaced.body.items[0].name).toBe('B');
  });

  it('includes tags on applications list', async () => {
    const fx = await seedMinimalFixtures();

    await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/tags`)
      .set(authHeader(fx.seeker.token))
      .send({ name: 'Remote' });

    const list = await getTestAgent()
      .get('/api/seeker/applications')
      .set(authHeader(fx.seeker.token));

    expect(list.status).toBe(200);
    expect(list.body.items[0].tags).toHaveLength(1);
    expect(list.body.items[0].tags[0].name).toBe('Remote');
  });

  it('deletes tag and removes join rows', async () => {
    const fx = await seedMinimalFixtures();

    const created = await getTestAgent()
      .post('/api/seeker/tags')
      .set(authHeader(fx.seeker.token))
      .send({ name: 'Temp' });

    await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/tags`)
      .set(authHeader(fx.seeker.token))
      .send({ tagId: created.body.tag.id });

    const del = await getTestAgent()
      .delete(`/api/seeker/tags/${created.body.tag.id}`)
      .set(authHeader(fx.seeker.token));

    expect(del.status).toBe(204);

    const joins = await prisma.jobApplicationTag.count({
      where: { tagId: created.body.tag.id },
    });
    expect(joins).toBe(0);
  });
});
