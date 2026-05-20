import { prisma } from '@huntflow/db';

import { getEmployerCompanyId } from './employerProfile';

export async function getEmployerApplication(applicationId: string, employerUserId: string) {
  const companyId = await getEmployerCompanyId(employerUserId);
  if (!companyId) return null;

  return prisma.jobApplication.findFirst({
    where: { id: applicationId, companyId },
    select: { id: true, userId: true, companyId: true, jobListingId: true },
  });
}

export async function getSeekerApplication(applicationId: string, seekerUserId: string) {
  return prisma.jobApplication.findFirst({
    where: { id: applicationId, userId: seekerUserId },
    select: { id: true, userId: true, companyId: true },
  });
}
