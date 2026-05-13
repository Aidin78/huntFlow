import { Router } from 'express';
import { prisma } from '@huntflow/db';
import type { Prisma } from '@huntflow/db';
import { z } from 'zod';

import { sendError } from '../lib/errors';

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
        where: { isActive: true },
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
