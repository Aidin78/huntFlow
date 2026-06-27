import { prisma } from '@huntflow/db';

import { getSeekerApplication } from './applicationAccess';
import { deleteFileIfExists } from './uploads';
import { validateResumeFile } from './uploads';

export type ResumeErrorCode = 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR';

export async function resolveResumeForApplication(
  userId: string,
  resumeFileId?: string | null,
): Promise<
  { ok: true; resumeFileId: string | null } | { ok: false; code: ResumeErrorCode; message: string }
> {
  if (resumeFileId === undefined || resumeFileId === null) {
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId },
      select: { currentResumeFileId: true },
    });
    return { ok: true, resumeFileId: profile?.currentResumeFileId ?? null };
  }

  const file = await prisma.userFile.findFirst({
    where: { id: resumeFileId, userId, kind: 'RESUME' },
    select: { id: true },
  });
  if (!file) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Invalid resume file' };
  }

  return { ok: true, resumeFileId: file.id };
}

export async function updateApplicationResume(
  applicationId: string,
  userId: string,
  resumeFileId: string | null,
): Promise<
  { ok: true; resumeFileId: string | null } | { ok: false; code: ResumeErrorCode; message: string }
> {
  const access = await getSeekerApplication(applicationId, userId);
  if (!access) {
    return { ok: false, code: 'NOT_FOUND', message: 'Application not found' };
  }

  if (resumeFileId !== null) {
    const resolved = await resolveResumeForApplication(userId, resumeFileId);
    if (!resolved.ok) {
      return resolved;
    }
    resumeFileId = resolved.resumeFileId;
  }

  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { resumeFileId },
  });

  return { ok: true, resumeFileId };
}

export async function uploadApplicationResume(
  applicationId: string,
  userId: string,
  file: { originalname: string; mimetype: string; size: number; filename: string },
): Promise<
  { ok: true; resumeFileId: string } | { ok: false; code: ResumeErrorCode; message: string }
> {
  const access = await getSeekerApplication(applicationId, userId);
  if (!access) {
    return { ok: false, code: 'NOT_FOUND', message: 'Application not found' };
  }

  const validationError = validateResumeFile(file.mimetype, file.size);
  if (validationError) {
    return { ok: false, code: 'VALIDATION_ERROR', message: validationError };
  }

  const userFile = await prisma.$transaction(async (tx) => {
    const created = await tx.userFile.create({
      data: {
        userId,
        kind: 'RESUME',
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey: file.filename,
      },
      select: { id: true },
    });

    await tx.jobSeekerProfile.upsert({
      where: { userId },
      create: { userId, currentResumeFileId: created.id },
      update: { currentResumeFileId: created.id },
    });

    await tx.jobApplication.update({
      where: { id: applicationId },
      data: { resumeFileId: created.id },
    });

    return created;
  });

  return { ok: true, resumeFileId: userFile.id };
}

export async function isResumeReferencedByApplications(resumeFileId: string): Promise<boolean> {
  const count = await prisma.jobApplication.count({
    where: { resumeFileId },
  });
  return count > 0;
}

export async function safeDeleteResumeFileIfUnreferenced(
  resumeFileId: string,
  storageKey: string,
): Promise<void> {
  const referenced = await isResumeReferencedByApplications(resumeFileId);
  if (referenced) {
    return;
  }
  deleteFileIfExists(storageKey);
  await prisma.userFile.delete({ where: { id: resumeFileId } }).catch(() => undefined);
}
