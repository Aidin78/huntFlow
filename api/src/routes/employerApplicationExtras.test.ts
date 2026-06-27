import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';

describe('employer application contacts, links, and attachments', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('includes seeker extras on employer detail for board applications', async () => {
    const fx = await seedMinimalFixtures();

    const contact = await prisma.contact.create({
      data: {
        companyId: fx.company.id,
        name: 'Recruiter Pat',
        email: 'pat@example.com',
      },
    });
    await prisma.jobApplicationContact.create({
      data: {
        jobApplicationId: fx.application.id,
        contactId: contact.id,
        role: 'Recruiter',
      },
    });

    await prisma.jobApplicationLink.create({
      data: {
        jobApplicationId: fx.application.id,
        label: 'Portfolio',
        url: 'https://example.com/portfolio',
      },
    });

    const attachment = await prisma.attachment.create({
      data: {
        jobApplicationId: fx.application.id,
        filename: 'notes.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        storageKey: 'test-notes.pdf',
      },
    });

    const detail = await getTestAgent()
      .get(`/api/employer/applications/${fx.application.id}`)
      .set(authHeader(fx.employer.token));
    expect(detail.status).toBe(200);
    expect(detail.body.contacts).toHaveLength(1);
    expect(detail.body.contacts[0].name).toBe('Recruiter Pat');
    expect(detail.body.links).toHaveLength(1);
    expect(detail.body.attachments).toHaveLength(1);
    expect(detail.body.attachments[0].filename).toBe('notes.pdf');

    const download = await getTestAgent()
      .get(`/api/attachments/${attachment.id}`)
      .set(authHeader(fx.employer.token));
    expect(download.status).not.toBe(403);
  });

  it('denies employer attachment download for manual applications', async () => {
    const fx = await seedMinimalFixtures();

    const manual = await prisma.jobApplication.create({
      data: {
        title: 'Manual role',
        status: 'APPLIED',
        userId: fx.seeker.id,
        companyId: fx.company.id,
        jobListingId: null,
      },
    });

    const attachment = await prisma.attachment.create({
      data: {
        jobApplicationId: manual.id,
        filename: 'private.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 512,
        storageKey: 'private.pdf',
      },
    });

    const res = await getTestAgent()
      .get(`/api/attachments/${attachment.id}`)
      .set(authHeader(fx.employer.token));
    expect(res.status).toBe(403);
  });
});
