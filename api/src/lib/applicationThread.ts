import { prisma } from '@huntflow/db';

export async function ensureApplicationThread(jobApplicationId: string): Promise<string> {
  const existing = await prisma.applicationThread.findUnique({
    where: { jobApplicationId },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.applicationThread.create({
    data: { jobApplicationId },
    select: { id: true },
  });
  return created.id;
}
