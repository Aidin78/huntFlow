import { prisma } from '@huntflow/db';

export async function getEmployerCompanyId(userId: string): Promise<string | null> {
  const profile = await prisma.employerProfile.findUnique({
    where: { userId },
    select: { companyId: true },
  });
  return profile?.companyId ?? null;
}

export async function ensureEmployerCompany(
  userId: string,
  company: { name: string; website?: string; linkedin?: string },
): Promise<string> {
  const existing = await getEmployerCompanyId(userId);
  if (existing) {
    return existing;
  }

  const created = await prisma.$transaction(async (tx) => {
    const co = await tx.company.create({
      data: {
        name: company.name.trim(),
        website: company.website?.trim() || undefined,
        linkedin: company.linkedin?.trim() || undefined,
      },
    });
    await tx.employerProfile.create({
      data: { userId, companyId: co.id },
    });
    return co.id;
  });

  return created;
}
