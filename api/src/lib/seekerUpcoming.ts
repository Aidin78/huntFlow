import { prisma } from '@huntflow/db';

import { displayCompanyName } from './manualApplication';

export type UpcomingItemKind = 'interview' | 'reminder';

export type UpcomingItem = {
  kind: UpcomingItemKind;
  id: string;
  applicationId: string;
  applicationTitle: string;
  companyName: string;
  title: string;
  at: string;
  isOverdue: boolean;
};

export type ListSeekerUpcomingResult = {
  items: UpcomingItem[];
  interviewCount: number;
  reminderCount: number;
};

const DEFAULT_HORIZON_DAYS = 30;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export async function listSeekerUpcoming(
  userId: string,
  opts?: { limit?: number; horizonDays?: number },
): Promise<ListSeekerUpcomingResult> {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const horizonDays = opts?.horizonDays ?? DEFAULT_HORIZON_DAYS;
  const now = new Date();
  const horizonEnd = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000);

  const applicationSelect = {
    id: true,
    title: true,
    company: { select: { name: true } },
  } as const;

  const [interviews, reminders] = await Promise.all([
    prisma.interview.findMany({
      where: {
        jobApplication: { userId },
        scheduledAt: { gte: now, lte: horizonEnd },
      },
      orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        jobApplication: { select: applicationSelect },
      },
    }),
    prisma.reminder.findMany({
      where: {
        status: 'PENDING',
        jobApplication: { userId },
        remindAt: { lte: horizonEnd },
      },
      orderBy: [{ remindAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        title: true,
        remindAt: true,
        jobApplication: { select: applicationSelect },
      },
    }),
  ]);

  const interviewItems: UpcomingItem[] = interviews.map((row) => ({
    kind: 'interview',
    id: row.id,
    applicationId: row.jobApplication.id,
    applicationTitle: row.jobApplication.title,
    companyName: displayCompanyName(row.jobApplication.company.name),
    title: row.title,
    at: row.scheduledAt.toISOString(),
    isOverdue: false,
  }));

  const reminderItems: UpcomingItem[] = reminders.map((row) => ({
    kind: 'reminder',
    id: row.id,
    applicationId: row.jobApplication.id,
    applicationTitle: row.jobApplication.title,
    companyName: displayCompanyName(row.jobApplication.company.name),
    title: row.title,
    at: row.remindAt.toISOString(),
    isOverdue: row.remindAt < now,
  }));

  const merged = [...interviewItems, ...reminderItems].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  return {
    items: merged.slice(0, limit),
    interviewCount: interviewItems.length,
    reminderCount: reminderItems.length,
  };
}
