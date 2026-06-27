import { prisma } from '@huntflow/db';

import { deleteFileIfExists } from './uploads';
import { verifyPassword } from './password';

export async function deleteUserAccount(
  userId: string,
  password: string,
): Promise<{ ok: true } | { ok: false; code: 'UNAUTHORIZED' | 'NOT_FOUND' }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
      files: { select: { storageKey: true } },
      jobSeekerProfile: {
        select: { currentResumeFile: { select: { storageKey: true } } },
      },
    },
  });

  if (!user) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, code: 'UNAUTHORIZED' };
  }

  const attachmentKeys = await prisma.attachment.findMany({
    where: { jobApplication: { userId } },
    select: { storageKey: true },
  });

  for (const file of user.files) {
    if (file.storageKey) deleteFileIfExists(file.storageKey);
  }
  for (const att of attachmentKeys) {
    if (att.storageKey) deleteFileIfExists(att.storageKey);
  }

  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}
