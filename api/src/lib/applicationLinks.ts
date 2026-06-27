import type { ApplicationLink } from '@huntflow/contracts';
import { prisma } from '@huntflow/db';

import { getSeekerApplication } from './applicationAccess';
import { sanitizePlainText } from './sanitize';

export const JOB_POSTING_LABEL = 'Job posting';

export type LinkErrorCode = 'NOT_FOUND' | 'VALIDATION_ERROR';

export type ApplicationLinkDto = ApplicationLink;

const linkSelect = {
  id: true,
  jobApplicationId: true,
  label: true,
  url: true,
  createdAt: true,
} as const;

function mapLink(row: {
  id: string;
  jobApplicationId: string;
  label: string | null;
  url: string;
  createdAt: Date;
}): ApplicationLinkDto {
  return {
    id: row.id,
    applicationId: row.jobApplicationId,
    label: row.label,
    url: row.url,
    createdAt: row.createdAt.toISOString(),
  };
}

function normalizeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

async function assertSeekerOwnsApplication(
  applicationId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; code: LinkErrorCode }> {
  const access = await getSeekerApplication(applicationId, userId);
  if (!access) {
    return { ok: false, code: 'NOT_FOUND' };
  }
  return { ok: true };
}

export async function upsertJobPostingLink(
  tx: Pick<typeof prisma, 'jobApplicationLink'>,
  applicationId: string,
  url: string | null,
): Promise<void> {
  const link = await tx.jobApplicationLink.findFirst({
    where: { jobApplicationId: applicationId, label: JOB_POSTING_LABEL },
    select: { id: true },
  });

  if (url) {
    if (link) {
      await tx.jobApplicationLink.update({ where: { id: link.id }, data: { url } });
    } else {
      await tx.jobApplicationLink.create({
        data: { jobApplicationId: applicationId, label: JOB_POSTING_LABEL, url },
      });
    }
  } else if (link) {
    await tx.jobApplicationLink.delete({ where: { id: link.id } });
  }
}

export async function listApplicationLinks(
  applicationId: string,
  userId: string,
): Promise<{ ok: true; items: ApplicationLinkDto[] } | { ok: false; code: LinkErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const rows = await prisma.jobApplicationLink.findMany({
    where: { jobApplicationId: applicationId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: linkSelect,
  });

  return { ok: true, items: rows.map(mapLink) };
}

export type CreateLinkInput = {
  label?: string;
  url: string;
};

export async function createApplicationLink(
  applicationId: string,
  userId: string,
  input: CreateLinkInput,
): Promise<
  { ok: true; link: ApplicationLinkDto } | { ok: false; code: LinkErrorCode; message?: string }
> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const url = normalizeUrl(input.url);
  if (!url) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Valid URL is required' };
  }

  const label = input.label?.trim()
    ? sanitizePlainText(input.label.trim(), 100)
    : null;

  if (label === JOB_POSTING_LABEL) {
    const row = await prisma.$transaction(async (tx) => {
      await upsertJobPostingLink(tx, applicationId, url);
      const link = await tx.jobApplicationLink.findFirst({
        where: { jobApplicationId: applicationId, label: JOB_POSTING_LABEL },
        select: linkSelect,
      });
      if (!link) throw new Error('Job posting link missing after upsert');
      return link;
    });
    return { ok: true, link: mapLink(row) };
  }

  const row = await prisma.jobApplicationLink.create({
    data: {
      jobApplicationId: applicationId,
      label,
      url,
    },
    select: linkSelect,
  });

  return { ok: true, link: mapLink(row) };
}

export type UpdateLinkInput = {
  label?: string | null;
  url?: string;
};

export async function updateApplicationLink(
  applicationId: string,
  linkId: string,
  userId: string,
  input: UpdateLinkInput,
): Promise<
  { ok: true; link: ApplicationLinkDto } | { ok: false; code: LinkErrorCode; message?: string }
> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const existing = await prisma.jobApplicationLink.findFirst({
    where: { id: linkId, jobApplicationId: applicationId },
    select: { id: true, label: true },
  });
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  let url: string | undefined;
  if (input.url !== undefined) {
    const normalized = normalizeUrl(input.url);
    if (!normalized) {
      return { ok: false, code: 'VALIDATION_ERROR', message: 'Valid URL is required' };
    }
    url = normalized;
  }

  const nextLabel =
    input.label !== undefined
      ? input.label?.trim()
        ? sanitizePlainText(input.label.trim(), 100)
        : null
      : undefined;

  if (nextLabel === JOB_POSTING_LABEL && existing.label !== JOB_POSTING_LABEL) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: `Use a single "${JOB_POSTING_LABEL}" link; edit the existing one instead`,
    };
  }

  const row = await prisma.jobApplicationLink.update({
    where: { id: linkId },
    data: {
      ...(url !== undefined ? { url } : {}),
      ...(nextLabel !== undefined ? { label: nextLabel } : {}),
    },
    select: linkSelect,
  });

  return { ok: true, link: mapLink(row) };
}

export async function deleteApplicationLink(
  applicationId: string,
  linkId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; code: LinkErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const existing = await prisma.jobApplicationLink.findFirst({
    where: { id: linkId, jobApplicationId: applicationId },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  await prisma.jobApplicationLink.delete({ where: { id: linkId } });
  return { ok: true };
}
