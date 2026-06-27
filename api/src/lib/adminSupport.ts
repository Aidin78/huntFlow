import { prisma } from '@huntflow/db';

export type SupportInquiryStatus = 'OPEN' | 'RESOLVED';

export type SupportInquiryListItem = {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: SupportInquiryStatus;
  createdAt: string;
  resolvedAt: string | null;
};

export type SupportInquiryDetail = SupportInquiryListItem & {
  message: string;
  adminNotes: string | null;
  emailSent: boolean;
  user: { id: string; email: string; name: string | null; role: string } | null;
};

export async function listSupportInquiries(options: {
  status?: SupportInquiryStatus;
  q?: string;
  cursor?: string;
  limit?: number;
}): Promise<{ items: SupportInquiryListItem[]; nextCursor: string | null; hasMore: boolean }> {
  const limit = Math.min(Math.max(options.limit ?? 30, 1), 100);
  const q = options.q?.trim();

  const rows = await prisma.supportInquiry.findMany({
    where: {
      ...(options.status ? { status: options.status } : {}),
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { subject: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(options.cursor ? { id: { lt: options.cursor } } : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      status: true,
      createdAt: true,
      resolvedAt: true,
    },
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: page.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      resolvedAt: row.resolvedAt?.toISOString() ?? null,
    })),
    nextCursor: hasMore ? page[page.length - 1]!.id : null,
    hasMore,
  };
}

export async function getSupportInquiry(id: string): Promise<SupportInquiryDetail | null> {
  const row = await prisma.supportInquiry.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      message: true,
      status: true,
      adminNotes: true,
      emailSent: true,
      createdAt: true,
      resolvedAt: true,
      user: { select: { id: true, email: true, name: true, role: true } },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    adminNotes: row.adminNotes,
    emailSent: row.emailSent,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    user: row.user,
  };
}

export type UpdateSupportInquiryInput = {
  status?: SupportInquiryStatus;
  adminNotes?: string | null;
};

export async function updateSupportInquiry(
  id: string,
  input: UpdateSupportInquiryInput,
): Promise<SupportInquiryDetail | null> {
  const existing = await prisma.supportInquiry.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!existing) return null;

  let resolvedAt: Date | null | undefined;
  if (input.status !== undefined) {
    resolvedAt = input.status === 'RESOLVED' ? new Date() : null;
  }

  await prisma.supportInquiry.update({
    where: { id },
    data: {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(resolvedAt !== undefined ? { resolvedAt } : {}),
      ...(input.adminNotes !== undefined
        ? {
            adminNotes: input.adminNotes?.trim()
              ? input.adminNotes.trim().slice(0, 4000)
              : null,
          }
        : {}),
    },
  });

  return getSupportInquiry(id);
}
