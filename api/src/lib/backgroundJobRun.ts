import { prisma } from '@huntflow/db';

export async function tryAcquireBackgroundJobRun(jobKey: string): Promise<boolean> {
  try {
    await prisma.backgroundJobRun.create({ data: { jobKey } });
    return true;
  } catch (e) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      return false;
    }
    throw e;
  }
}
