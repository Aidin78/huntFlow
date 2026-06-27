import fs from 'fs';
import path from 'path';

import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
  TEST_PASSWORD,
} from '../test/helpers';

const MINIMAL_PDF = Buffer.from('%PDF-1.4\n%EOF');

describe('seeker application attachments', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('uploads, lists, downloads, and deletes attachment', async () => {
    const fx = await seedMinimalFixtures();

    const upload = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/attachments`)
      .set(authHeader(fx.seeker.token))
      .attach('file', MINIMAL_PDF, {
        filename: 'portfolio.pdf',
        contentType: 'application/pdf',
      })
      .field('notes', 'Portfolio sample');

    expect(upload.status).toBe(201);
    expect(upload.body.attachment.filename).toBe('portfolio.pdf');
    expect(upload.body.attachment.notes).toBe('Portfolio sample');

    const attachmentId = upload.body.attachment.id as string;

    const list = await getTestAgent()
      .get(`/api/seeker/applications/${fx.application.id}/attachments`)
      .set(authHeader(fx.seeker.token));
    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);

    const download = await getTestAgent()
      .get(`/api/attachments/${attachmentId}`)
      .set(authHeader(fx.seeker.token));
    expect(download.status).toBe(200);
    expect(download.headers['content-type']).toContain('application/pdf');

    const del = await getTestAgent()
      .delete(`/api/seeker/applications/${fx.application.id}/attachments/${attachmentId}`)
      .set(authHeader(fx.seeker.token));
    expect(del.status).toBe(204);

    const row = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    expect(row).toBeNull();
  });

  it('rejects invalid mime type', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/attachments`)
      .set(authHeader(fx.seeker.token))
      .attach('file', Buffer.from('plain text'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe('VALIDATION_ERROR');
  });

  it('denies download for another user', async () => {
    const fx = await seedMinimalFixtures();

    const upload = await getTestAgent()
      .post(`/api/seeker/applications/${fx.application.id}/attachments`)
      .set(authHeader(fx.seeker.token))
      .attach('file', MINIMAL_PDF, {
        filename: 'secret.pdf',
        contentType: 'application/pdf',
      });
    expect(upload.status).toBe(201);

    const otherSeeker = await getTestAgent().post('/api/auth/register').send({
      email: 'other-attach@test.huntflow.app',
      password: TEST_PASSWORD,
      role: 'JOB_SEEKER',
    });

    const download = await getTestAgent()
      .get(`/api/attachments/${upload.body.attachment.id}`)
      .set(authHeader(otherSeeker.body.token));
    expect(download.status).toBe(403);

    const stored = await prisma.attachment.findUnique({
      where: { id: upload.body.attachment.id },
      select: { storageKey: true },
    });
    if (stored?.storageKey) {
      const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads-test');
      const fullPath = path.join(uploadDir, stored.storageKey);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  });
});
