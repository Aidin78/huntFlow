import { prisma } from '@huntflow/db';

import { upsertJobPostingLink } from './applicationLinks';
import { resolveResumeForApplication } from './applicationResume';
import { sanitizePlainText } from './sanitize';

const PERSONAL_TRACKING_SUFFIX = ' (personal tracking)';

export type CreateManualApplicationInput = {
  title: string;
  companyName: string;
  appliedAt?: Date;
  location?: string;
  salaryText?: string;
  notes?: string;
  sourceUrl?: string;
  resumeFileId?: string;
};

export type CreateManualApplicationResult =
  | {
      ok: true;
      application: {
        id: string;
        title: string;
        status: string;
        appliedAt: string | null;
        location: string | null;
        salaryText: string | null;
        notes: string | null;
        isManual: true;
        company: { id: string; name: string };
      };
    }
  | { ok: false; code: 'VALIDATION_ERROR' | 'CONFLICT'; message: string };

export async function resolveCompanyForManualApp(companyName: string): Promise<string> {
  const normalized = companyName.trim();
  if (!normalized) {
    throw new Error('Company name is required');
  }

  const occupied = await prisma.company.findFirst({
    where: { name: normalized, employerProfiles: { some: {} } },
    select: { id: true },
  });

  const storageName = occupied ? `${normalized}${PERSONAL_TRACKING_SUFFIX}` : normalized;

  const company = await prisma.company.upsert({
    where: { name: storageName },
    create: { name: storageName },
    update: {},
    select: { id: true },
  });

  return company.id;
}

export function displayCompanyName(storedName: string): string {
  if (storedName.endsWith(PERSONAL_TRACKING_SUFFIX)) {
    return storedName.slice(0, -PERSONAL_TRACKING_SUFFIX.length);
  }
  return storedName;
}

export async function createManualApplication(
  userId: string,
  input: CreateManualApplicationInput,
): Promise<CreateManualApplicationResult> {
  const title = input.title.trim();
  const companyName = input.companyName.trim();
  if (!title || !companyName) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Title and company are required' };
  }

  const location = input.location?.trim() ? sanitizePlainText(input.location, 200) : null;
  const salaryText = input.salaryText?.trim() ? sanitizePlainText(input.salaryText, 100) : null;
  const notes = input.notes?.trim() ? sanitizePlainText(input.notes, 4000) : null;
  const sourceUrl = input.sourceUrl?.trim() || null;
  const appliedAt = input.appliedAt ?? new Date();

  try {
    const companyId = await resolveCompanyForManualApp(companyName);

    const resumeResolved = await resolveResumeForApplication(userId, input.resumeFileId);
    if (!resumeResolved.ok) {
      return { ok: false, code: 'VALIDATION_ERROR', message: resumeResolved.message };
    }

    const created = await prisma.$transaction(async (tx) => {
      const application = await tx.jobApplication.create({
        data: {
          title,
          status: 'APPLIED',
          appliedAt,
          location,
          salaryText,
          notes,
          userId,
          companyId,
          jobListingId: null,
          resumeFileId: resumeResolved.resumeFileId,
        },
        select: {
          id: true,
          title: true,
          status: true,
          appliedAt: true,
          location: true,
          salaryText: true,
          notes: true,
          company: { select: { id: true, name: true } },
        },
      });

      await tx.jobApplicationStatusEvent.create({
        data: {
          jobApplicationId: application.id,
          from: null,
          to: 'APPLIED',
          note: 'Added manually',
        },
      });

      if (sourceUrl) {
        await upsertJobPostingLink(tx, application.id, sourceUrl);
      }

      return application;
    });

    return {
      ok: true,
      application: {
        id: created.id,
        title: created.title,
        status: created.status,
        appliedAt: created.appliedAt?.toISOString() ?? null,
        location: created.location,
        salaryText: created.salaryText,
        notes: created.notes,
        isManual: true,
        company: {
          id: created.company.id,
          name: displayCompanyName(created.company.name),
        },
      },
    };
  } catch (e) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      return {
        ok: false,
        code: 'CONFLICT',
        message: 'You already track this role at this company',
      };
    }
    throw e;
  }
}

export type UpdateManualApplicationInput = {
  title?: string;
  companyName?: string;
  appliedAt?: Date | null;
  location?: string | null;
  salaryText?: string | null;
  notes?: string | null;
  sourceUrl?: string | null;
};

export type UpdateManualApplicationResult =
  | { ok: true; application: { id: string; title: string; updatedAt: string } }
  | { ok: false; code: 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'CONFLICT'; message: string };

export async function updateManualApplication(
  userId: string,
  applicationId: string,
  input: UpdateManualApplicationInput,
): Promise<UpdateManualApplicationResult> {
  const existing = await prisma.jobApplication.findFirst({
    where: { id: applicationId, userId },
    select: { id: true, jobListingId: true, title: true },
  });

  if (!existing) {
    return { ok: false, code: 'NOT_FOUND', message: 'Application not found' };
  }

  if (existing.jobListingId) {
    return { ok: false, code: 'FORBIDDEN', message: 'Only manual applications can be edited' };
  }

  const title = input.title !== undefined ? input.title.trim() : undefined;
  if (title !== undefined && !title) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Title is required' };
  }

  let companyId: string | undefined;
  if (input.companyName !== undefined) {
    const name = input.companyName.trim();
    if (!name) {
      return { ok: false, code: 'VALIDATION_ERROR', message: 'Company name is required' };
    }
    companyId = await resolveCompanyForManualApp(name);
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.jobApplication.update({
        where: { id: applicationId },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(companyId !== undefined ? { companyId } : {}),
          ...(input.appliedAt !== undefined ? { appliedAt: input.appliedAt } : {}),
          ...(input.location !== undefined
            ? { location: input.location?.trim() ? sanitizePlainText(input.location, 200) : null }
            : {}),
          ...(input.salaryText !== undefined
            ? { salaryText: input.salaryText?.trim() ? sanitizePlainText(input.salaryText, 100) : null }
            : {}),
          ...(input.notes !== undefined
            ? { notes: input.notes?.trim() ? sanitizePlainText(input.notes, 4000) : null }
            : {}),
        },
        select: { id: true, title: true, updatedAt: true },
      });

      if (input.sourceUrl !== undefined) {
        const url = input.sourceUrl?.trim() || null;
        await upsertJobPostingLink(tx, applicationId, url);
      }

      return app;
    });

    return {
      ok: true,
      application: {
        id: updated.id,
        title: updated.title,
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (e) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      return {
        ok: false,
        code: 'CONFLICT',
        message: 'You already track this role at this company',
      };
    }
    throw e;
  }
}
