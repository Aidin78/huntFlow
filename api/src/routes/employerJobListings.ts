import { Router } from 'express';
import { ExperienceLevel, prisma, WorkArrangement } from '@huntflow/db';
import { z } from 'zod';

import {
  employerCompanySelect,
  isCompanyProfileComplete,
} from '../lib/employerCompany';
import { ensureEmployerCompany, getEmployerCompanyId } from '../lib/employerProfile';
import { sendError } from '../lib/errors';
import { lifecycleOf, wasEverPublished } from '../lib/jobListingStatus';
import { requireEmployer } from '../middleware/requireEmployer';

const listingIdSchema = z.string().uuid();

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s && s.length > 0 ? s : undefined))
  .refine((s) => s === undefined || z.string().url().safeParse(s).success, 'Invalid URL');

const companyBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(200),
  about: z.string().trim().min(20).max(8000),
  website: optionalUrl,
  linkedin: optionalUrl,
  locations: z.string().trim().max(500).optional(),
});

const listingBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(8000).optional(),
  city: z.string().trim().max(120).optional(),
  workArrangement: z.nativeEnum(WorkArrangement),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  salaryText: z.string().trim().max(120).optional(),
  sourceUrl: optionalUrl,
});

const createListingSchema = listingBodySchema;

const employerListingSelect = {
  id: true,
  title: true,
  summary: true,
  city: true,
  workArrangement: true,
  experienceLevel: true,
  salaryText: true,
  sourceUrl: true,
  publishedAt: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { applications: true } },
} as const;

export const employerJobListingsRouter = Router();

employerJobListingsRouter.use(requireEmployer);

employerJobListingsRouter.get('/employer/company', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const profile = await prisma.employerProfile.findUnique({
    where: { userId },
    include: { company: { select: employerCompanySelect } },
  });

  res.json({ company: profile?.company ?? null });
});

employerJobListingsRouter.put('/employer/company', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const parsed = companyBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid company', parsed.error.flatten());
    return;
  }

  const { name, tagline, about, website, linkedin, locations } = parsed.data;
  const websiteVal = website && website.length ? website : undefined;
  const linkedinVal = linkedin && linkedin.length ? linkedin : undefined;
  const locationsVal = locations?.length ? locations : undefined;

  try {
    const existingCompanyId = await getEmployerCompanyId(userId);
    if (existingCompanyId) {
      const company = await prisma.company.update({
        where: { id: existingCompanyId },
        data: {
          name,
          tagline,
          about,
          website: websiteVal,
          linkedin: linkedinVal,
          locations: locationsVal ?? null,
        },
        select: employerCompanySelect,
      });
      res.json({ company });
      return;
    }

    const companyId = await ensureEmployerCompany(userId, {
      name,
      website: websiteVal,
      linkedin: linkedinVal,
    });
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { tagline, about, locations: locationsVal ?? null },
      select: employerCompanySelect,
    });
    res.json({ company });
  } catch (e: unknown) {
    if (isPrismaUniqueViolation(e)) {
      sendError(res, 409, 'CONFLICT', 'A company with this name already exists');
      return;
    }
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not save company');
  }
});

employerJobListingsRouter.get('/employer/job-listings', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const companyId = await getEmployerCompanyId(userId);
  if (!companyId) {
    res.json({ company: null, items: [] });
    return;
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: employerCompanySelect,
  });

  const rows = await prisma.jobListing.findMany({
    where: { companyId },
    orderBy: [{ updatedAt: 'desc' }],
    select: employerListingSelect,
  });

  const items = rows.map((row) => ({
    ...row,
    status: lifecycleOf(row),
    applicantCount: row._count.applications,
    _count: undefined,
  }));

  res.json({ company, items });
});

employerJobListingsRouter.post('/employer/job-listings', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const parsed = createListingSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid listing', parsed.error.flatten());
    return;
  }

  const listingData = parsed.data;

  try {
    const companyId = await getEmployerCompanyId(userId);
    if (!companyId) {
      sendError(
        res,
        403,
        'FORBIDDEN',
        'Complete your company profile before creating job postings',
      );
      return;
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: employerCompanySelect,
    });
    if (!isCompanyProfileComplete(company)) {
      sendError(
        res,
        403,
        'FORBIDDEN',
        'Complete your company profile before creating job postings',
      );
      return;
    }

    const listing = await prisma.jobListing.create({
      data: {
        title: listingData.title,
        summary: listingData.summary?.length ? listingData.summary : undefined,
        city: listingData.city?.length ? listingData.city : undefined,
        workArrangement: listingData.workArrangement,
        experienceLevel: listingData.experienceLevel,
        salaryText: listingData.salaryText?.length ? listingData.salaryText : undefined,
        sourceUrl: listingData.sourceUrl?.length ? listingData.sourceUrl : undefined,
        companyId,
        publishedAt: null,
        isActive: false,
      },
      select: employerListingSelect,
    });

    res.status(201).json({
      item: {
        ...listing,
        status: lifecycleOf(listing),
        applicantCount: listing._count.applications,
        _count: undefined,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not create listing');
  }
});

async function loadEmployerListing(userId: string, listingId: string) {
  const companyId = await getEmployerCompanyId(userId);
  if (!companyId) return null;

  return prisma.jobListing.findFirst({
    where: { id: listingId, companyId },
    select: employerListingSelect,
  });
}

employerJobListingsRouter.get('/employer/job-listings/:id', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = listingIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid listing id');
    return;
  }

  const listing = await loadEmployerListing(userId, idParsed.data);
  if (!listing) {
    sendError(res, 404, 'NOT_FOUND', 'Listing not found');
    return;
  }

  res.json({
    item: {
      ...listing,
      status: lifecycleOf(listing),
      applicantCount: listing._count.applications,
      _count: undefined,
    },
  });
});

employerJobListingsRouter.patch('/employer/job-listings/:id', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = listingIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid listing id');
    return;
  }

  const parsed = listingBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid listing', parsed.error.flatten());
    return;
  }

  const existing = await loadEmployerListing(userId, idParsed.data);
  if (!existing) {
    sendError(res, 404, 'NOT_FOUND', 'Listing not found');
    return;
  }

  const data = parsed.data;
  const listing = await prisma.jobListing.update({
    where: { id: idParsed.data },
    data: {
      title: data.title,
      summary: data.summary?.length ? data.summary : null,
      city: data.city?.length ? data.city : null,
      workArrangement: data.workArrangement,
      experienceLevel: data.experienceLevel,
      salaryText: data.salaryText?.length ? data.salaryText : null,
      sourceUrl: data.sourceUrl?.length ? data.sourceUrl : null,
    },
    select: employerListingSelect,
  });

  res.json({
    item: {
      ...listing,
      status: lifecycleOf(listing),
      applicantCount: listing._count.applications,
      _count: undefined,
    },
  });
});

employerJobListingsRouter.delete('/employer/job-listings/:id', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = listingIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid listing id');
    return;
  }

  const existing = await loadEmployerListing(userId, idParsed.data);
  if (!existing) {
    sendError(res, 404, 'NOT_FOUND', 'Listing not found');
    return;
  }

  if (wasEverPublished(existing)) {
    sendError(
      res,
      403,
      'FORBIDDEN',
      'Published listings cannot be deleted. Deactivate the posting instead.',
    );
    return;
  }

  await prisma.jobListing.delete({ where: { id: idParsed.data } });
  res.status(204).send();
});

employerJobListingsRouter.post('/employer/job-listings/:id/publish', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = listingIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid listing id');
    return;
  }

  const existing = await loadEmployerListing(userId, idParsed.data);
  if (!existing) {
    sendError(res, 404, 'NOT_FOUND', 'Listing not found');
    return;
  }

  const listing = await prisma.jobListing.update({
    where: { id: idParsed.data },
    data: {
      isActive: true,
      publishedAt: existing.publishedAt ?? new Date(),
    },
    select: employerListingSelect,
  });

  res.json({
    item: {
      ...listing,
      status: lifecycleOf(listing),
      applicantCount: listing._count.applications,
      _count: undefined,
    },
  });
});

employerJobListingsRouter.post('/employer/job-listings/:id/deactivate', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = listingIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid listing id');
    return;
  }

  const existing = await loadEmployerListing(userId, idParsed.data);
  if (!existing) {
    sendError(res, 404, 'NOT_FOUND', 'Listing not found');
    return;
  }

  if (!wasEverPublished(existing)) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Only published listings can be deactivated');
    return;
  }

  const listing = await prisma.jobListing.update({
    where: { id: idParsed.data },
    data: { isActive: false },
    select: employerListingSelect,
  });

  res.json({
    item: {
      ...listing,
      status: lifecycleOf(listing),
      applicantCount: listing._count.applications,
      _count: undefined,
    },
  });
});

function isPrismaUniqueViolation(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'P2002'
  );
}
