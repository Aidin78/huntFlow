import type { ApplicationContact } from '@huntflow/contracts';
import { prisma } from '@huntflow/db';

import { getSeekerApplication } from './applicationAccess';
import { sanitizePlainText } from './sanitize';

export type ContactErrorCode = 'NOT_FOUND' | 'VALIDATION_ERROR';

export type ApplicationContactDto = ApplicationContact;

const junctionSelect = {
  role: true,
  createdAt: true,
  contact: {
    select: {
      id: true,
      name: true,
      title: true,
      email: true,
      phone: true,
      linkedin: true,
      notes: true,
    },
  },
} as const;

function mapContact(
  applicationId: string,
  row: {
    role: string | null;
    createdAt: Date;
    contact: {
      id: string;
      name: string;
      title: string | null;
      email: string | null;
      phone: string | null;
      linkedin: string | null;
      notes: string | null;
    };
  },
): ApplicationContactDto {
  return {
    id: row.contact.id,
    applicationId,
    role: row.role,
    name: row.contact.name,
    title: row.contact.title,
    email: row.contact.email,
    phone: row.contact.phone,
    linkedin: row.contact.linkedin,
    notes: row.contact.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

async function assertSeekerOwnsApplication(
  applicationId: string,
  userId: string,
): Promise<{ ok: true; companyId: string } | { ok: false; code: ContactErrorCode }> {
  const access = await getSeekerApplication(applicationId, userId);
  if (!access) {
    return { ok: false, code: 'NOT_FOUND' };
  }
  return { ok: true, companyId: access.companyId };
}

async function getJunctionForApplication(applicationId: string, contactId: string) {
  return prisma.jobApplicationContact.findFirst({
    where: { jobApplicationId: applicationId, contactId },
    select: junctionSelect,
  });
}

function normalizeOptionalText(value: string | undefined, max: number): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed ? sanitizePlainText(trimmed, max) : null;
}

export async function listApplicationContacts(
  applicationId: string,
  userId: string,
): Promise<{ ok: true; items: ApplicationContactDto[] } | { ok: false; code: ContactErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const rows = await prisma.jobApplicationContact.findMany({
    where: { jobApplicationId: applicationId },
    orderBy: [{ createdAt: 'asc' }, { contactId: 'asc' }],
    select: junctionSelect,
  });

  return { ok: true, items: rows.map((row) => mapContact(applicationId, row)) };
}

export type CreateContactInput = {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
  role?: string;
};

export async function createApplicationContact(
  applicationId: string,
  userId: string,
  input: CreateContactInput,
): Promise<
  { ok: true; contact: ApplicationContactDto } | { ok: false; code: ContactErrorCode; message?: string }
> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const name = input.name.trim();
  if (!name) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Name is required' };
  }

  const row = await prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        companyId: access.companyId,
        name: sanitizePlainText(name, 200),
        title: normalizeOptionalText(input.title, 200),
        email: normalizeOptionalText(input.email, 320),
        phone: normalizeOptionalText(input.phone, 40),
        linkedin: normalizeOptionalText(input.linkedin, 500),
        notes: normalizeOptionalText(input.notes, 4000),
      },
      select: { id: true },
    });

    return tx.jobApplicationContact.create({
      data: {
        jobApplicationId: applicationId,
        contactId: contact.id,
        role: normalizeOptionalText(input.role, 100),
      },
      select: junctionSelect,
    });
  });

  return { ok: true, contact: mapContact(applicationId, row) };
}

export type UpdateContactInput = {
  name?: string;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  notes?: string | null;
  role?: string | null;
};

export async function updateApplicationContact(
  applicationId: string,
  contactId: string,
  userId: string,
  input: UpdateContactInput,
): Promise<
  { ok: true; contact: ApplicationContactDto } | { ok: false; code: ContactErrorCode; message?: string }
> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const existing = await getJunctionForApplication(applicationId, contactId);
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  if (input.name !== undefined && !input.name.trim()) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Name is required' };
  }

  const row = await prisma.$transaction(async (tx) => {
    await tx.contact.update({
      where: { id: contactId },
      data: {
        ...(input.name !== undefined ? { name: sanitizePlainText(input.name.trim(), 200) } : {}),
        ...(input.title !== undefined
          ? { title: input.title?.trim() ? sanitizePlainText(input.title, 200) : null }
          : {}),
        ...(input.email !== undefined
          ? { email: input.email?.trim() ? sanitizePlainText(input.email, 320) : null }
          : {}),
        ...(input.phone !== undefined
          ? { phone: input.phone?.trim() ? sanitizePlainText(input.phone, 40) : null }
          : {}),
        ...(input.linkedin !== undefined
          ? { linkedin: input.linkedin?.trim() ? sanitizePlainText(input.linkedin, 500) : null }
          : {}),
        ...(input.notes !== undefined
          ? { notes: input.notes?.trim() ? sanitizePlainText(input.notes, 4000) : null }
          : {}),
      },
    });

    if (input.role !== undefined) {
      await tx.jobApplicationContact.update({
        where: {
          jobApplicationId_contactId: { jobApplicationId: applicationId, contactId },
        },
        data: { role: input.role?.trim() ? sanitizePlainText(input.role, 100) : null },
      });
    }

    const updated = await tx.jobApplicationContact.findFirst({
      where: { jobApplicationId: applicationId, contactId },
      select: junctionSelect,
    });

    if (!updated) {
      throw new Error('Contact link missing after update');
    }

    return updated;
  });

  return { ok: true, contact: mapContact(applicationId, row) };
}

export async function deleteApplicationContact(
  applicationId: string,
  contactId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; code: ContactErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const existing = await prisma.jobApplicationContact.findFirst({
    where: { jobApplicationId: applicationId, contactId },
    select: { contactId: true },
  });
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.jobApplicationContact.delete({
      where: {
        jobApplicationId_contactId: { jobApplicationId: applicationId, contactId },
      },
    });

    const remaining = await tx.jobApplicationContact.count({ where: { contactId } });
    if (remaining === 0) {
      await tx.contact.delete({ where: { id: contactId } });
    }
  });

  return { ok: true };
}
