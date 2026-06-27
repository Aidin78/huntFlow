import fs from 'fs';

import { Router } from 'express';
import { z } from 'zod';

import { sendError } from '../lib/errors';
import { canAccessAttachment, canAccessUserFile } from '../lib/fileAccess';
import { getAttachmentForDownload } from '../lib/applicationAttachments';
import { resolveStoragePath } from '../lib/uploads';
import { requireAuth } from '../middleware/requireAuth';

export const filesRouter = Router();

const fileIdSchema = z.string().uuid();

filesRouter.get('/attachments/:id', requireAuth, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = fileIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid attachment id');
    return;
  }

  const allowed = await canAccessAttachment(idParsed.data, userId, req.userRole);
  if (!allowed) {
    sendError(res, 403, 'FORBIDDEN', 'Access denied');
    return;
  }

  const attachment = await getAttachmentForDownload(idParsed.data);
  if (!attachment?.storageKey) {
    sendError(res, 404, 'NOT_FOUND', 'Attachment not found');
    return;
  }

  try {
    const fullPath = resolveStoragePath(attachment.storageKey);
    if (!fs.existsSync(fullPath)) {
      sendError(res, 404, 'NOT_FOUND', 'File not found on disk');
      return;
    }

    const inline = req.query.inline === '1' || req.query.inline === 'true';
    const mimeType = attachment.mimeType ?? 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(attachment.filename)}"`,
    );
    fs.createReadStream(fullPath).pipe(res);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not read file');
  }
});

filesRouter.get('/files/:id', requireAuth, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = z.string().uuid().safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid file id');
    return;
  }

  const allowed = await canAccessUserFile(idParsed.data, userId, req.userRole);
  if (!allowed) {
    sendError(res, 403, 'FORBIDDEN', 'Access denied');
    return;
  }

  const { prisma } = await import('@huntflow/db');
  const file = await prisma.userFile.findUnique({
    where: { id: idParsed.data },
    select: { storageKey: true, filename: true, mimeType: true },
  });

  if (!file) {
    sendError(res, 404, 'NOT_FOUND', 'File not found');
    return;
  }

  try {
    const fullPath = resolveStoragePath(file.storageKey);
    if (!fs.existsSync(fullPath)) {
      sendError(res, 404, 'NOT_FOUND', 'File not found on disk');
      return;
    }

    const inline = req.query.inline === '1' || req.query.inline === 'true';
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(file.filename)}"`,
    );
    fs.createReadStream(fullPath).pipe(res);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not read file');
  }
});
