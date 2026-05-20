import { Router } from 'express';
import { prisma } from '@huntflow/db';
import { z } from 'zod';

import { getEmployerApplication } from '../lib/applicationAccess';
import { listApplicationMessages, postApplicationMessage } from '../lib/applicationMessages';
import {
  employerApplicationDetailSelect,
  mapEmployerApplicationDetail,
} from '../lib/employerApplicationDetail';
import { getEmployerCompanyId } from '../lib/employerProfile';
import { sendError } from '../lib/errors';
import { requireEmployer } from '../middleware/requireEmployer';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

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
  user: { select: { id: true, name: true, email: true } },
  jobListing: { select: { id: true, title: true } },
} as const;

export const employerApplicationsRouter = Router();

employerApplicationsRouter.use(requireEmployer);

employerApplicationsRouter.get('/employer/applications', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const companyId = await getEmployerCompanyId(userId);
  if (!companyId) {
    res.json({ items: [], nextCursor: null, hasMore: false, jobListings: [] });
    return;
  }

  const jobListingIdParsed = z.string().uuid().safeParse(req.query.jobListingId);
  if (req.query.jobListingId !== undefined && !jobListingIdParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid jobListingId');
    return;
  }

  const cursorParsed = z.string().uuid().safeParse(req.query.cursor);
  if (req.query.cursor !== undefined && !cursorParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid cursor');
    return;
  }

  const limitParsed = z.coerce.number().int().min(1).max(MAX_LIMIT).safeParse(req.query.limit);
  const limit = limitParsed.success ? limitParsed.data : DEFAULT_LIMIT;

  const jobListingId = jobListingIdParsed.success ? jobListingIdParsed.data : undefined;
  const cursor = cursorParsed.success ? cursorParsed.data : undefined;

  try {
    const jobListings = cursor
      ? undefined
      : await prisma.jobListing.findMany({
          where: { companyId },
          orderBy: [{ updatedAt: 'desc' }],
          select: {
            id: true,
            title: true,
            _count: { select: { applications: true } },
          },
        });

    if (jobListingId) {
      const listing = await prisma.jobListing.findFirst({
        where: { id: jobListingId, companyId },
        select: { id: true },
      });
      if (!listing) {
        sendError(res, 404, 'NOT_FOUND', 'Job posting not found');
        return;
      }
    }

    const rows = await prisma.jobApplication.findMany({
      where: {
        companyId,
        ...(jobListingId ? { jobListingId } : {}),
      },
      orderBy: [{ appliedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: applicationSelect,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    res.json({
      items: page,
      nextCursor,
      hasMore,
      ...(jobListings
        ? {
            jobListings: jobListings.map((j) => ({
              id: j.id,
              title: j.title,
              applicantCount: j._count.applications,
            })),
          }
        : {}),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load applications');
  }
});

employerApplicationsRouter.get('/employer/applications/:id', async (req, res) => {
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
    const access = await getEmployerApplication(idParsed.data, userId);
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

employerApplicationsRouter.get('/employer/applications/:id/messages', async (req, res) => {
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
    const access = await getEmployerApplication(idParsed.data, userId);
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

employerApplicationsRouter.post('/employer/applications/:id/messages', async (req, res) => {
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
    const access = await getEmployerApplication(idParsed.data, userId);
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
