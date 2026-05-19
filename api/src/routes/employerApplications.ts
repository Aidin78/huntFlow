import { Router } from 'express';
import { prisma } from '@huntflow/db';
import { z } from 'zod';

import { getEmployerCompanyId } from '../lib/employerProfile';
import { sendError } from '../lib/errors';
import { requireEmployer } from '../middleware/requireEmployer';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const applicationSelect = {
  id: true,
  title: true,
  status: true,
  appliedAt: true,
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
