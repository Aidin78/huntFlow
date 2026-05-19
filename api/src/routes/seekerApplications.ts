import { Router } from 'express';
import { prisma } from '@huntflow/db';

import { sendError } from '../lib/errors';
import { requireJobSeeker } from '../middleware/requireJobSeeker';

const applicationSelect = {
  id: true,
  title: true,
  status: true,
  appliedAt: true,
  location: true,
  salaryText: true,
  createdAt: true,
  updatedAt: true,
  company: { select: { id: true, name: true } },
  jobListing: { select: { id: true, title: true } },
} as const;

export const seekerApplicationsRouter = Router();

seekerApplicationsRouter.use(requireJobSeeker);

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
