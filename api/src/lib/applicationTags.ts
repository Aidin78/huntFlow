import { prisma } from '@huntflow/db';

import { assertSeekerOwnsApplication } from './applicationSchedule';
import { findOrCreateUserTag, mapTagSummary, type TagSummaryDto } from './tags';

export type ApplicationTagErrorCode = 'NOT_FOUND' | 'VALIDATION_ERROR' | 'FORBIDDEN';

const applicationTagSelect = {
  tag: { select: { id: true, name: true, color: true } },
} as const;

function mapApplicationTag(row: { tag: { id: string; name: string; color: string | null } }): TagSummaryDto {
  return mapTagSummary(row.tag);
}

export async function listApplicationTags(
  applicationId: string,
  userId: string,
): Promise<{ ok: true; items: TagSummaryDto[] } | { ok: false; code: ApplicationTagErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const rows = await prisma.jobApplicationTag.findMany({
    where: { jobApplicationId: applicationId },
    orderBy: [{ tag: { name: 'asc' } }, { tagId: 'asc' }],
    select: applicationTagSelect,
  });

  return { ok: true, items: rows.map(mapApplicationTag) };
}

async function verifyTagOwnership(tagId: string, userId: string) {
  return prisma.tag.findFirst({
    where: { id: tagId, userId },
    select: { id: true, name: true, color: true },
  });
}

export async function attachApplicationTag(
  applicationId: string,
  userId: string,
  tagId: string,
): Promise<{ ok: true; tag: TagSummaryDto } | { ok: false; code: ApplicationTagErrorCode; message?: string }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const tag = await verifyTagOwnership(tagId, userId);
  if (!tag) {
    return { ok: false, code: 'FORBIDDEN', message: 'Tag not found' };
  }

  try {
    await prisma.jobApplicationTag.create({
      data: { jobApplicationId: applicationId, tagId },
    });
  } catch (e) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      return { ok: true, tag: mapTagSummary(tag) };
    }
    throw e;
  }

  return { ok: true, tag: mapTagSummary(tag) };
}

export async function attachApplicationTagByName(
  applicationId: string,
  userId: string,
  name: string,
  color?: string | null,
): Promise<{ ok: true; tag: TagSummaryDto } | { ok: false; code: ApplicationTagErrorCode; message?: string }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const tagResult = await findOrCreateUserTag(userId, name, color);
  if (!tagResult.ok) {
    return tagResult;
  }

  return attachApplicationTag(applicationId, userId, tagResult.tag.id);
}

export async function detachApplicationTag(
  applicationId: string,
  userId: string,
  tagId: string,
): Promise<{ ok: true } | { ok: false; code: ApplicationTagErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const existing = await prisma.jobApplicationTag.findUnique({
    where: {
      jobApplicationId_tagId: { jobApplicationId: applicationId, tagId },
    },
    select: { jobApplicationId: true },
  });
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  await prisma.jobApplicationTag.delete({
    where: {
      jobApplicationId_tagId: { jobApplicationId: applicationId, tagId },
    },
  });

  return { ok: true };
}

export async function replaceApplicationTags(
  applicationId: string,
  userId: string,
  tagIds: string[],
): Promise<{ ok: true; items: TagSummaryDto[] } | { ok: false; code: ApplicationTagErrorCode; message?: string }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const uniqueIds = [...new Set(tagIds)];
  if (uniqueIds.length > 0) {
    const ownedTags = await prisma.tag.findMany({
      where: { userId, id: { in: uniqueIds } },
      select: { id: true },
    });
    if (ownedTags.length !== uniqueIds.length) {
      return { ok: false, code: 'FORBIDDEN', message: 'One or more tags are invalid' };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.jobApplicationTag.deleteMany({
      where: {
        jobApplicationId: applicationId,
        ...(uniqueIds.length > 0 ? { tagId: { notIn: uniqueIds } } : {}),
      },
    });

    if (uniqueIds.length > 0) {
      const existing = await tx.jobApplicationTag.findMany({
        where: { jobApplicationId: applicationId },
        select: { tagId: true },
      });
      const existingIds = new Set(existing.map((row) => row.tagId));
      const toCreate = uniqueIds.filter((id) => !existingIds.has(id));
      if (toCreate.length > 0) {
        await tx.jobApplicationTag.createMany({
          data: toCreate.map((tagId) => ({ jobApplicationId: applicationId, tagId })),
          skipDuplicates: true,
        });
      }
    }
  });

  const result = await listApplicationTags(applicationId, userId);
  if (!result.ok) {
    return result;
  }
  return { ok: true, items: result.items };
}
