import { Router } from 'express';
import { prisma, UserRole } from '@huntflow/db';
import type { Prisma } from '@huntflow/db';
import { z } from 'zod';

import { ensureApplicationThread } from '../lib/applicationThread';
import { resolveResumeForApplication } from '../lib/applicationResume';
import { notifyEmployersOfNewApplication } from '../lib/notifications';
import { sanitizePlainText } from '../lib/sanitize';
import { sendError } from '../lib/errors';
import { requireAuth } from '../middleware/requireAuth';

const applyBodySchema = z.object({
  coverLetter: z.string().max(4000).optional(),
  resumeFileId: z.string().uuid().optional(),
});

const listingIdSchema = z.string().uuid();

const listingDetailSelect = {
  id: true,
  title: true,
  summary: true,
  city: true,
  workArrangement: true,
  experienceLevel: true,
  salaryText: true,
  sourceUrl: true,
  publishedAt: true,
  company: { select: { id: true, name: true, website: true, linkedin: true } },
} satisfies Prisma.JobListingSelect;

const workArrangementSchema = z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional();
const experienceSchema = z.enum(['INTERN', 'ENTRY', 'MID', 'SENIOR', 'LEAD']).optional();

function emptyToUndefined(s: string | undefined): string | undefined {
  if (s === undefined) return undefined;
  const t = s.trim();
  return t.length ? t : undefined;
}

export const jobListingsRouter = Router();

jobListingsRouter.get('/job-listings', async (req, res) => {
  const q = emptyToUndefined(typeof req.query.q === 'string' ? req.query.q : undefined);
  const job = emptyToUndefined(typeof req.query.job === 'string' ? req.query.job : undefined);
  const city = emptyToUndefined(typeof req.query.city === 'string' ? req.query.city : undefined);

  const waParsed = workArrangementSchema.safeParse(
    typeof req.query.workArrangement === 'string' ? req.query.workArrangement : undefined,
  );
  if (!waParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid workArrangement', waParsed.error.flatten());
    return;
  }

  const exParsed = experienceSchema.safeParse(
    typeof req.query.experience === 'string' ? req.query.experience : undefined,
  );
  if (!exParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid experience', exParsed.error.flatten());
    return;
  }

  const workArrangement = waParsed.data;
  const experience = exParsed.data;

  const and: Prisma.JobListingWhereInput[] = [];

  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { company: { name: { contains: q, mode: 'insensitive' } } },
      ],
    });
  }

  if (job) {
    and.push({ title: { equals: job, mode: 'insensitive' } });
  }

  if (city) {
    and.push({ city: { equals: city, mode: 'insensitive' } });
  }

  if (workArrangement) {
    and.push({ workArrangement });
  }

  if (experience) {
    and.push({ experienceLevel: experience });
  }

  const where: Prisma.JobListingWhereInput = {
    isActive: true,
    publishedAt: { not: null },
    ...(and.length ? { AND: and } : {}),
  };

  try {
    const [items, facetRows] = await Promise.all([
      prisma.jobListing.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }],
        select: {
          id: true,
          title: true,
          summary: true,
          city: true,
          workArrangement: true,
          experienceLevel: true,
          salaryText: true,
          sourceUrl: true,
          publishedAt: true,
          company: { select: { id: true, name: true } },
        },
      }),
      prisma.jobListing.findMany({
        where: { isActive: true, publishedAt: { not: null } },
        select: {
          city: true,
          title: true,
          workArrangement: true,
          experienceLevel: true,
        },
      }),
    ]);

    const cities = [
      ...new Set(
        facetRows.map((r) => r.city).filter((c): c is string => typeof c === 'string' && c.length > 0),
      ),
    ].sort((a, b) => a.localeCompare(b));

    const jobTitles = [...new Set(facetRows.map((r) => r.title))].sort((a, b) => a.localeCompare(b));

    const workArrangements = [...new Set(facetRows.map((r) => r.workArrangement))].sort();

    const experienceLevels = [...new Set(facetRows.map((r) => r.experienceLevel))].sort();

    res.json({
      items,
      filters: {
        cities,
        jobTitles,
        workArrangements: workArrangements.sort(),
        experienceLevels: experienceLevels.sort(),
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load job listings');
  }
});

jobListingsRouter.get('/job-listings/:id', async (req, res) => {
  const parsed = listingIdSchema.safeParse(req.params.id);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid job listing id');
    return;
  }

  try {
    const listing = await prisma.jobListing.findFirst({
      where: { id: parsed.data, isActive: true, publishedAt: { not: null } },
      select: listingDetailSelect,
    });

    if (!listing) {
      sendError(res, 404, 'NOT_FOUND', 'Job listing not found');
      return;
    }

    res.json({ item: listing });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load job listing');
  }
});

jobListingsRouter.get('/job-listings/:id/apply-status', requireAuth, async (req, res) => {
  const parsed = listingIdSchema.safeParse(req.params.id);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid job listing id');
    return;
  }

  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  try {
    const application = await prisma.jobApplication.findFirst({
      where: { userId, jobListingId: parsed.data },
      select: { id: true, status: true, appliedAt: true },
    });

    res.json({
      applied: Boolean(application),
      application: application ?? null,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load apply status');
  }
});

jobListingsRouter.post('/job-listings/:id/apply', requireAuth, async (req, res) => {
  const parsed = listingIdSchema.safeParse(req.params.id);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid job listing id');
    return;
  }

  const userId = req.userId;
  const userRole = req.userRole;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  if (userRole !== UserRole.JOB_SEEKER) {
    sendError(
      res,
      403,
      'FORBIDDEN',
      'Only job seeker accounts can apply to listings. Sign in as a job seeker or create a job seeker account.',
    );
    return;
  }

  try {
    const listing = await prisma.jobListing.findFirst({
      where: { id: parsed.data, isActive: true, publishedAt: { not: null } },
      select: {
        id: true,
        title: true,
        city: true,
        workArrangement: true,
        salaryText: true,
        sourceUrl: true,
        companyId: true,
      },
    });

    if (!listing) {
      sendError(res, 404, 'NOT_FOUND', 'Job listing not found');
      return;
    }

    const existing = await prisma.jobApplication.findFirst({
      where: { userId, jobListingId: listing.id },
      select: { id: true, status: true, appliedAt: true },
    });

    if (existing) {
      res.status(200).json({
        alreadyApplied: true,
        application: existing,
      });
      return;
    }

    const bodyParsed = applyBodySchema.safeParse(req.body ?? {});
    if (!bodyParsed.success) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', bodyParsed.error.flatten());
      return;
    }
    const coverLetterRaw = bodyParsed.success ? bodyParsed.data.coverLetter : undefined;
    const coverLetter = coverLetterRaw
      ? sanitizePlainText(coverLetterRaw, 4000) || undefined
      : undefined;

    const resumeResolved = await resolveResumeForApplication(
      userId,
      bodyParsed.success ? bodyParsed.data.resumeFileId : undefined,
    );
    if (!resumeResolved.ok) {
      sendError(res, 400, resumeResolved.code, resumeResolved.message);
      return;
    }

    const locationParts = [listing.city, listing.workArrangement].filter(Boolean);
    const location = locationParts.length ? locationParts.join(' · ') : null;

    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.jobApplication.create({
        data: {
          title: listing.title,
          status: 'APPLIED',
          appliedAt: new Date(),
          coverLetter: coverLetter ?? null,
          location,
          salaryText: listing.salaryText,
          userId,
          companyId: listing.companyId,
          jobListingId: listing.id,
          resumeFileId: resumeResolved.resumeFileId,
        },
        select: { id: true, status: true, appliedAt: true, title: true },
      });

      if (listing.sourceUrl) {
        await tx.jobApplicationLink.create({
          data: {
            jobApplicationId: created.id,
            label: 'Original posting',
            url: listing.sourceUrl,
          },
        });
      }

      await tx.jobApplicationStatusEvent.create({
        data: {
          jobApplicationId: created.id,
          from: null,
          to: 'APPLIED',
          note: 'Applied via huntFlow job board',
        },
      });

      return created;
    });

    await ensureApplicationThread(application.id);

    const applicant = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    await notifyEmployersOfNewApplication({
      companyId: listing.companyId,
      applicationId: application.id,
      applicationTitle: application.title,
      applicantName: applicant?.name ?? null,
      applicantEmail: applicant?.email ?? 'applicant',
      actorUserId: userId,
    }).catch((e) => {
      // eslint-disable-next-line no-console
      console.error('Failed to create application notification', e);
    });

    res.status(201).json({
      alreadyApplied: false,
      application,
    });
  } catch (e: unknown) {
    if (isPrismaUniqueViolation(e)) {
      sendError(res, 409, 'CONFLICT', 'You have already applied to this role');
      return;
    }
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not submit application');
  }
});

function isPrismaUniqueViolation(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'P2002'
  );
}
