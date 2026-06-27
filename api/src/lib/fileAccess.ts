import { prisma } from '@huntflow/db';

import { getEmployerCompanyId } from './employerProfile';

export async function canAccessUserFile(
  fileId: string,
  userId: string,
  userRole: string | undefined,
): Promise<boolean> {
  const file = await prisma.userFile.findUnique({
    where: { id: fileId },
    select: { userId: true },
  });
  if (!file) return false;

  if (file.userId === userId) return true;

  if (userRole !== 'EMPLOYER') return false;

  const companyId = await getEmployerCompanyId(userId);
  if (!companyId) return false;

  const linked = await prisma.jobApplication.findFirst({
    where: { companyId, resumeFileId: fileId },
    select: { id: true },
  });

  return Boolean(linked);
}

export async function canAccessAttachment(
  attachmentId: string,
  userId: string,
  userRole?: string,
): Promise<boolean> {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    select: {
      jobApplication: {
        select: { userId: true, companyId: true, jobListingId: true },
      },
    },
  });
  if (!attachment) return false;

  if (attachment.jobApplication.userId === userId) return true;

  if (userRole !== 'EMPLOYER') return false;

  const companyId = await getEmployerCompanyId(userId);
  if (!companyId) return false;

  const app = attachment.jobApplication;
  return app.jobListingId != null && app.companyId === companyId;
}
