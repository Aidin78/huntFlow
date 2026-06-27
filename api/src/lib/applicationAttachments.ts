import type { ApplicationAttachment } from '@huntflow/contracts';
import { prisma } from '@huntflow/db';

import { getSeekerApplication } from './applicationAccess';
import { deleteFileIfExists } from './uploads';
import { sanitizePlainText } from './sanitize';

export type AttachmentErrorCode = 'NOT_FOUND' | 'VALIDATION_ERROR';

export type ApplicationAttachmentDto = ApplicationAttachment;

const attachmentSelect = {
  id: true,
  jobApplicationId: true,
  filename: true,
  mimeType: true,
  sizeBytes: true,
  notes: true,
  createdAt: true,
} as const;

function mapAttachment(row: {
  id: string;
  jobApplicationId: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number | null;
  notes: string | null;
  createdAt: Date;
}): ApplicationAttachmentDto {
  return {
    id: row.id,
    applicationId: row.jobApplicationId,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

async function assertSeekerOwnsApplication(
  applicationId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; code: AttachmentErrorCode }> {
  const access = await getSeekerApplication(applicationId, userId);
  if (!access) {
    return { ok: false, code: 'NOT_FOUND' };
  }
  return { ok: true };
}

async function getAttachmentForApplication(applicationId: string, attachmentId: string) {
  return prisma.attachment.findFirst({
    where: { id: attachmentId, jobApplicationId: applicationId },
    select: { ...attachmentSelect, storageKey: true },
  });
}

export async function listApplicationAttachments(
  applicationId: string,
  userId: string,
): Promise<{ ok: true; items: ApplicationAttachmentDto[] } | { ok: false; code: AttachmentErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const rows = await prisma.attachment.findMany({
    where: { jobApplicationId: applicationId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: attachmentSelect,
  });

  return { ok: true, items: rows.map(mapAttachment) };
}

export type CreateAttachmentInput = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  notes?: string;
};

export async function createApplicationAttachment(
  applicationId: string,
  userId: string,
  input: CreateAttachmentInput,
): Promise<
  { ok: true; attachment: ApplicationAttachmentDto } | { ok: false; code: AttachmentErrorCode; message?: string }
> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const filename = input.filename.trim();
  if (!filename) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Filename is required' };
  }

  const row = await prisma.attachment.create({
    data: {
      jobApplicationId: applicationId,
      filename: sanitizePlainText(filename, 255),
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageKey: input.storageKey,
      notes: input.notes?.trim() ? sanitizePlainText(input.notes, 4000) : null,
    },
    select: attachmentSelect,
  });

  return { ok: true, attachment: mapAttachment(row) };
}

export async function deleteApplicationAttachment(
  applicationId: string,
  attachmentId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; code: AttachmentErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const existing = await getAttachmentForApplication(applicationId, attachmentId);
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  await prisma.attachment.delete({ where: { id: attachmentId } });

  if (existing.storageKey) {
    deleteFileIfExists(existing.storageKey);
  }

  return { ok: true };
}

export async function getAttachmentForDownload(attachmentId: string) {
  return prisma.attachment.findUnique({
    where: { id: attachmentId },
    select: {
      storageKey: true,
      filename: true,
      mimeType: true,
      jobApplication: { select: { userId: true } },
    },
  });
}
