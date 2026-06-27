import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
  TEST_PASSWORD,
} from '../test/helpers';

describe('seeker application contacts', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates contact on own application', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/contacts`)
      .set(authHeader(fx.seeker.token))
      .send({
        name: 'Jane Recruiter',
        role: 'Recruiter',
        email: 'jane@example.com',
      });

    expect(res.status).toBe(201);
    expect(res.body.contact.name).toBe('Jane Recruiter');
    expect(res.body.contact.role).toBe('Recruiter');
    expect(res.body.contact.applicationId).toBe(fx.application.id);
  });

  it('lists and updates contact', async () => {
    const fx = await seedMinimalFixtures();

    const created = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/contacts`)
      .set(authHeader(fx.seeker.token))
      .send({ name: 'Alex HM', role: 'Hiring manager' });
    expect(created.status).toBe(201);

    const list = await getTestAgent()
      .get(`/api/seeker/applications/${fx.application.id}/contacts`)
      .set(authHeader(fx.seeker.token));
    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);

    const contactId = created.body.contact.id as string;
    const updated = await getTestAgent()
      .patch(`/api/seeker/applications/${fx.application.id}/contacts/${contactId}`)
      .set(authHeader(fx.seeker.token))
      .send({ name: 'Alex Hiring Manager', phone: '+1 555 0100' });
    expect(updated.status).toBe(200);
    expect(updated.body.contact.name).toBe('Alex Hiring Manager');
    expect(updated.body.contact.phone).toBe('+1 555 0100');
  });

  it('deletes contact and removes orphan Contact row', async () => {
    const fx = await seedMinimalFixtures();

    const created = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/contacts`)
      .set(authHeader(fx.seeker.token))
      .send({ name: 'To Remove' });
    expect(created.status).toBe(201);

    const contactId = created.body.contact.id as string;

    const res = await getTestAgent()
      .delete(`/api/seeker/applications/${fx.application.id}/contacts/${contactId}`)
      .set(authHeader(fx.seeker.token));
    expect(res.status).toBe(204);

    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    expect(contact).toBeNull();
  });

  it('returns 404 when creating contact on another users application', async () => {
    const fx = await seedMinimalFixtures();

    const otherSeeker = await getTestAgent().post('/api/auth/register').send({
      email: 'other-seeker@test.huntflow.app',
      password: TEST_PASSWORD,
      role: 'JOB_SEEKER',
    });

    const res = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/contacts`)
      .set(authHeader(otherSeeker.body.token))
      .send({ name: 'Should fail' });

    expect(res.status).toBe(404);
  });
});
