import { Router } from 'express';
import { prisma } from '@huntflow/db';
import { z } from 'zod';

import { getSeekerApplication } from '../lib/applicationAccess';
import { listApplicationMessages, postApplicationMessage } from '../lib/applicationMessages';
import {
  employerApplicationDetailSelect,
  mapEmployerApplicationDetail,
} from '../lib/employerApplicationDetail';
import { sendError } from '../lib/errors';
import { requireJobSeeker } from '../middleware/requireJobSeeker';

const applicationIdSchema = z.string().uuid();

const messageBodySchema = z.object({
  body: z.string().min(1).max(4000),
});

const applicationSelect = {
  id: true,
  title: true,
  status: true,
  appliedAt: true,
  coverLetter: true,
  location: true,
  salaryText: true,
  createdAt: true,
  updatedAt: true,
  company: { select: { id: true, name: true } },
  jobListing: { select: { id: true, title: true } },
} as const;

export const seekerApplicationsRouter = Router();

seekerApplicationsRouter.use('/seeker', requireJobSeeker);

seekerApplicationsRouter.get('/seeker/applications', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  try {
    const items = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: [{ appliedAt: 'desc' }, { updatedAt: 'desc' }],
      select: applicationSelect,
    });

    const statusCounts = items.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {});

    res.json({ items, statusCounts });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load applications');
  }
});

seekerApplicationsRouter.get('/seeker/applications/:id', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  try {
    const access = await getSeekerApplication(idParsed.data, userId);
    if (!access) {
      sendError(res, 404, 'NOT_FOUND', 'Application not found');
      return;
    }

    const row = await prisma.jobApplication.findUnique({
      where: { id: idParsed.data },
      select: employerApplicationDetailSelect,
    });

    if (!row) {
      sendError(res, 404, 'NOT_FOUND', 'Application not found');
      return;
    }

    res.json(mapEmployerApplicationDetail(row));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load application');
  }
});

seekerApplicationsRouter.get('/seeker/applications/:id/messages', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  const cursorParsed = z.string().uuid().safeParse(req.query.cursor);
  if (req.query.cursor !== undefined && !cursorParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid cursor');
    return;
  }

  const limitParsed = z.coerce.number().int().min(1).max(100).safeParse(req.query.limit);
  const limit = limitParsed.success ? limitParsed.data : 30;

  try {
    const access = await getSeekerApplication(idParsed.data, userId);
    if (!access) {
      sendError(res, 404, 'NOT_FOUND', 'Application not found');
      return;
    }

    const result = await listApplicationMessages(idParsed.data, {
      cursor: cursorParsed.success ? cursorParsed.data : undefined,
      limit,
    });
    res.json(result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load messages');
  }
});

seekerApplicationsRouter.post('/seeker/applications/:id/messages', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  const parsed = messageBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid message', parsed.error.flatten());
    return;
  }

  try {
    const access = await getSeekerApplication(idParsed.data, userId);
    if (!access) {
      sendError(res, 404, 'NOT_FOUND', 'Application not found');
      return;
    }

    const result = await postApplicationMessage(idParsed.data, userId, parsed.data.body);
    if ('error' in result) {
      sendError(res, 400, result.error ?? 'VALIDATION_ERROR', result.message ?? 'Invalid message');
      return;
    }

    res.status(201).json(result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not send message');
  }
});
