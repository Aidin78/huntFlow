import { Router } from 'express';
import { prisma } from '@huntflow/db';

import { getEmployerCompanyId } from '../lib/employerProfile';
import { sendError } from '../lib/errors';
import { lifecycleOf } from '../lib/jobListingStatus';
import { requireEmployer } from '../middleware/requireEmployer';

const employerListingSelect = {
  id: true,
  title: true,
  city: true,
  workArrangement: true,
  publishedAt: true,
  isActive: true,
  updatedAt: true,
  _count: { select: { applications: true } },
} as const;

const applicationSelect = {
  id: true,
  title: true,
  status: true,
  appliedAt: true,
  user: { select: { name: true, email: true } },
} as const;

export const employerOverviewRouter = Router();

employerOverviewRouter.use('/employer', requireEmployer);

employerOverviewRouter.get('/employer/overview', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const companyId = await getEmployerCompanyId(userId);
  if (!companyId) {
    res.json({
      stats: {
        publishedPostings: 0,
        draftPostings: 0,
        totalApplications: 0,
        awaitingReview: 0,
        inPipeline: 0,
      },
      recentPostings: [],
      recentApplications: [],
    });
    return;
  }

  try {
    const [listings, applications, statusGroups] = await Promise.all([
      prisma.jobListing.findMany({
        where: { companyId },
        orderBy: [{ updatedAt: 'desc' }],
        take: 5,
        select: employerListingSelect,
      }),
      prisma.jobApplication.findMany({
        where: { companyId, jobListingId: { not: null } },
        orderBy: [{ appliedAt: 'desc' }, { id: 'desc' }],
        take: 5,
        select: applicationSelect,
      }),
      prisma.jobApplication.groupBy({
        by: ['status'],
        where: { companyId, jobListingId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const allListings = await prisma.jobListing.findMany({
      where: { companyId },
      select: { publishedAt: true, isActive: true },
    });

    let publishedPostings = 0;
    let draftPostings = 0;
    for (const row of allListings) {
      const status = lifecycleOf(row);
      if (status === 'PUBLISHED') publishedPostings += 1;
      else if (status === 'DRAFT') draftPostings += 1;
    }

    const statusCounts = statusGroups.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});

    const totalApplications = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);
    const awaitingReview = statusCounts.APPLIED ?? 0;
    const inPipeline = (statusCounts.INTERVIEW ?? 0) + (statusCounts.OFFER ?? 0);

    res.json({
      stats: {
        publishedPostings,
        draftPostings,
        totalApplications,
        awaitingReview,
        inPipeline,
      },
      recentPostings: listings.map((row) => {
        const locationParts = [row.city, row.workArrangement].filter(Boolean);
        return {
          id: row.id,
          title: row.title,
          status: lifecycleOf(row),
          applicantCount: row._count.applications,
          location: locationParts.length ? locationParts.join(' · ') : null,
          updatedAt: row.updatedAt.toISOString(),
        };
      }),
      recentApplications: applications.map((row) => ({
        id: row.id,
        title: row.title,
        status: row.status,
        appliedAt: row.appliedAt?.toISOString() ?? null,
        applicant: {
          name: row.user.name,
          email: row.user.email,
        },
      })),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load employer overview');
  }
});
