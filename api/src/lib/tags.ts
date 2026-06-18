import { prisma } from '@huntflow/db';

import { sanitizePlainText } from './sanitize';

export type TagErrorCode = 'NOT_FOUND' | 'VALIDATION_ERROR' | 'CONFLICT';

export const TAG_COLOR_PRESETS = [
  '#0d9488',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#64748b',
] as const;

export type TagDto = {
  id: string;
  name: string;
  color: string | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TagSummaryDto = {
  id: string;
  name: string;
  color: string | null;
};

const tagSelect = {
  id: true,
  name: true,
  color: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { jobApplications: true } },
} as const;

function mapTag(row: {
  id: string;
  name: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { jobApplications: number };
}): TagDto {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    usageCount: row._count.jobApplications,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapTagSummary(row: { id: string; name: string; color: string | null }): TagSummaryDto {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
  };
}

export function normalizeTagName(name: string): string {
  return sanitizePlainText(name, 40);
}

export function normalizeTagColor(color: string | null | undefined): string | null {
  if (!color) return null;
  const trimmed = color.trim();
  if (!TAG_COLOR_PRESETS.includes(trimmed as (typeof TAG_COLOR_PRESETS)[number])) {
    return null;
  }
  return trimmed;
}

export async function listUserTags(
  userId: string,
): Promise<{ ok: true; items: TagDto[] } | { ok: false; code: TagErrorCode }> {
  const rows = await prisma.tag.findMany({
    where: { userId },
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    select: tagSelect,
  });

  return { ok: true, items: rows.map(mapTag) };
}

export type CreateTagInput = {
  name: string;
  color?: string | null;
};

export async function createUserTag(
  userId: string,
  input: CreateTagInput,
): Promise<{ ok: true; tag: TagDto } | { ok: false; code: TagErrorCode; message?: string }> {
  const name = normalizeTagName(input.name);
  if (!name) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Tag name is required' };
  }

  try {
    const row = await prisma.tag.create({
      data: {
        userId,
        name,
        color: normalizeTagColor(input.color),
      },
      select: tagSelect,
    });
    return { ok: true, tag: mapTag(row) };
  } catch (e) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      return { ok: false, code: 'CONFLICT', message: 'A tag with this name already exists' };
    }
    throw e;
  }
}

export type UpdateTagInput = {
  name?: string;
  color?: string | null;
};

export async function updateUserTag(
  tagId: string,
  userId: string,
  input: UpdateTagInput,
): Promise<{ ok: true; tag: TagDto } | { ok: false; code: TagErrorCode; message?: string }> {
  const existing = await prisma.tag.findFirst({
    where: { id: tagId, userId },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  if (input.name !== undefined && !normalizeTagName(input.name)) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Tag name is required' };
  }

  try {
    const row = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(input.name !== undefined ? { name: normalizeTagName(input.name) } : {}),
        ...(input.color !== undefined ? { color: normalizeTagColor(input.color) } : {}),
      },
      select: tagSelect,
    });
    return { ok: true, tag: mapTag(row) };
  } catch (e) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      return { ok: false, code: 'CONFLICT', message: 'A tag with this name already exists' };
    }
    throw e;
  }
}

export async function deleteUserTag(
  tagId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; code: TagErrorCode }> {
  const existing = await prisma.tag.findFirst({
    where: { id: tagId, userId },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  await prisma.tag.delete({ where: { id: tagId } });
  return { ok: true };
}

export async function findOrCreateUserTag(
  userId: string,
  name: string,
  color?: string | null,
): Promise<{ ok: true; tag: TagSummaryDto } | { ok: false; code: TagErrorCode; message?: string }> {
  const normalized = normalizeTagName(name);
  if (!normalized) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Tag name is required' };
  }

  const existing = await prisma.tag.findUnique({
    where: { userId_name: { userId, name: normalized } },
    select: { id: true, name: true, color: true },
  });
  if (existing) {
    return { ok: true, tag: mapTagSummary(existing) };
  }

  const created = await createUserTag(userId, { name: normalized, color });
  if (!created.ok) {
    return created;
  }
  return {
    ok: true,
    tag: {
      id: created.tag.id,
      name: created.tag.name,
      color: created.tag.color,
    },
  };
}
