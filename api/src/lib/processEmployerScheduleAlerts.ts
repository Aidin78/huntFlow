import { prisma } from '@huntflow/db';

import { createNotificationIfEnabled } from './notifications';
import { displayCompanyName } from './manualApplication';

export async function processEmployerScheduleAlerts(): Promise<{ interviews: number }> {
  const now = new Date();
  let interviewsNotified = 0;

  const dueInterviews = await prisma.interview.findMany({
    where: {
      scheduledAt: { lte: now },
      employerNotifiedAt: null,
      jobApplication: { jobListingId: { not: null } },
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      jobApplicationId: true,
      jobApplication: {
        select: {
          title: true,
          companyId: true,
          company: { select: { name: true } },
        },
      },
    },
    orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
  });

  for (const interview of dueInterviews) {
    const employerIds = await prisma.employerProfile.findMany({
      where: { companyId: interview.jobApplication.companyId },
      select: { userId: true },
    });

    const companyName = displayCompanyName(interview.jobApplication.company.name);
    const appTitle = interview.jobApplication.title;

    await Promise.all(
      employerIds.map((employer) =>
        createNotificationIfEnabled(employer.userId, 'INTERVIEW_UPCOMING', {
          type: 'INTERVIEW_UPCOMING',
          title: `Interview: ${interview.title}`,
          body: `${appTitle} at ${companyName}`,
          jobApplicationId: interview.jobApplicationId,
        }),
      ),
    );

    await prisma.interview.update({
      where: { id: interview.id },
      data: { employerNotifiedAt: now },
    });
    interviewsNotified += 1;
  }

  return { interviews: interviewsNotified };
}
