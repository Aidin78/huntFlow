import { prisma } from '@huntflow/db';

import { createNotificationIfEnabled } from './notifications';

export async function processScheduleAlertsForUser(
  userId: string,
): Promise<{ reminders: number; interviews: number }> {
  const now = new Date();
  let remindersNotified = 0;
  let interviewsNotified = 0;

  const dueReminders = await prisma.reminder.findMany({
    where: {
      status: 'PENDING',
      remindAt: { lte: now },
      notifiedAt: null,
      jobApplication: { userId },
    },
    select: {
      id: true,
      title: true,
      jobApplicationId: true,
      jobApplication: {
        select: { title: true, company: { select: { name: true } } },
      },
    },
    orderBy: [{ remindAt: 'asc' }, { id: 'asc' }],
  });

  for (const reminder of dueReminders) {
    const companyName = reminder.jobApplication.company.name;
    const appTitle = reminder.jobApplication.title;
    await createNotificationIfEnabled(userId, 'REMINDER_DUE', {
      type: 'REMINDER_DUE',
      title: `Reminder: ${reminder.title}`,
      body: `${appTitle} at ${companyName}`,
      jobApplicationId: reminder.jobApplicationId,
    });
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { notifiedAt: now },
    });
    remindersNotified += 1;
  }

  const dueInterviews = await prisma.interview.findMany({
    where: {
      scheduledAt: { lte: now },
      notifiedAt: null,
      jobApplication: { userId },
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      jobApplicationId: true,
      jobApplication: {
        select: { title: true, company: { select: { name: true } } },
      },
    },
    orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
  });

  for (const interview of dueInterviews) {
    const companyName = interview.jobApplication.company.name;
    const appTitle = interview.jobApplication.title;
    await createNotificationIfEnabled(userId, 'INTERVIEW_UPCOMING', {
      type: 'INTERVIEW_UPCOMING',
      title: `Interview: ${interview.title}`,
      body: `${appTitle} at ${companyName}`,
      jobApplicationId: interview.jobApplicationId,
    });
    await prisma.interview.update({
      where: { id: interview.id },
      data: { notifiedAt: now },
    });
    interviewsNotified += 1;
  }

  return { reminders: remindersNotified, interviews: interviewsNotified };
}
