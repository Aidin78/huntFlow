import fs from 'fs';
import path from 'path';

import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';
import { getUploadDir } from '../lib/uploads';

const MINIMAL_PDF = Buffer.from('%PDF-1.4\n%EOF');

async function uploadProfileResume(seekerToken: string, filename = 'profile.pdf'): Promise<string> {
  const res = await getTestAgent()
    .post('/api/seeker/resume')
    .set(authHeader(seekerToken))
    .attach('resume', MINIMAL_PDF, { filename, contentType: 'application/pdf' });
  expect(res.status).toBe(201);
  return res.body.resume.id as string;
}

describe('application resume', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('applies with explicit resumeFileId', async () => {
    const fx = await seedMinimalFixtures();
    const resumeId = await uploadProfileResume(fx.seeker.token);

    const freshListing = await prisma.jobListing.create({
      data: {
        title: 'Fresh Role',
        summary: 'No application yet',
        city: 'Berlin',
        workArrangement: 'REMOTE',
        experienceLevel: 'MID',
        companyId: fx.company.id,
        isActive: true,
        publishedAt: new Date(),
      },
    });

    const res = await getTestAgent()
      .post(`/api/job-listings/${freshListing.id}/apply`)
      .set(authHeader(fx.seeker.token))
      .send({ resumeFileId: resumeId });
    expect(res.status).toBe(201);

    const app = await prisma.jobApplication.findFirst({
      where: { userId: fx.seeker.id, jobListingId: freshListing.id },
    });
    expect(app?.resumeFileId).toBe(resumeId);
  });

  it('patches application resume', async () => {
    const fx = await seedMinimalFixtures();
    const firstId = await uploadProfileResume(fx.seeker.token, 'first.pdf');

    await prisma.jobApplication.update({
      where: { id: fx.application.id },
      data: { resumeFileId: firstId },
    });

    const secondId = await uploadProfileResume(fx.seeker.token, 'tailored.pdf');

    const patched = await getTestAgent()
      .patch(`/api/seeker/applications/${fx.application.id}/resume`)
      .set(authHeader(fx.seeker.token))
      .send({ resumeFileId: firstId });
    expect(patched.status).toBe(200);
    expect(patched.body.resumeFileId).toBe(firstId);

    const updated = await prisma.jobApplication.findUnique({ where: { id: fx.application.id } });
    expect(updated?.resumeFileId).toBe(firstId);
    expect(secondId).not.toBe(firstId);
  });

  it('keeps application resume file when profile resume is replaced', async () => {
    const fx = await seedMinimalFixtures();
    const originalId = await uploadProfileResume(fx.seeker.token);

    await prisma.jobApplication.update({
      where: { id: fx.application.id },
      data: { resumeFileId: originalId },
    });

    const original = await prisma.userFile.findUnique({
      where: { id: originalId },
      select: { storageKey: true },
    });
    expect(original?.storageKey).toBeTruthy();

    await uploadProfileResume(fx.seeker.token, 'new-profile.pdf');

    const stillThere = await prisma.userFile.findUnique({ where: { id: originalId } });
    expect(stillThere).not.toBeNull();

    if (original?.storageKey) {
      const fullPath = path.join(getUploadDir(), original.storageKey);
      expect(fs.existsSync(fullPath)).toBe(true);
    }

    const app = await prisma.jobApplication.findUnique({ where: { id: fx.application.id } });
    expect(app?.resumeFileId).toBe(originalId);
  });

  it('clears profile pointer but keeps file when deleting referenced profile resume', async () => {
    const fx = await seedMinimalFixtures();
    const resumeId = await uploadProfileResume(fx.seeker.token);

    await prisma.jobApplication.update({
      where: { id: fx.application.id },
      data: { resumeFileId: resumeId },
    });

    const del = await getTestAgent()
      .delete('/api/seeker/resume')
      .set(authHeader(fx.seeker.token));
    expect(del.status).toBe(204);

    const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId: fx.seeker.id } });
    expect(profile?.currentResumeFileId).toBeNull();

    const file = await prisma.userFile.findUnique({ where: { id: resumeId } });
    expect(file).not.toBeNull();

    const app = await prisma.jobApplication.findUnique({ where: { id: fx.application.id } });
    expect(app?.resumeFileId).toBe(resumeId);
  });
});
