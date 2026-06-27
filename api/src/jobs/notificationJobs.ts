import { prisma } from '@huntflow/db';

import { tryAcquireBackgroundJobRun } from '../lib/backgroundJobRun';
import {
  deliverDigestChannels,
  getMondayUtcWeekStart,
  shouldSendWeeklySummary,
} from '../lib/notificationDelivery';
import { processEmployerScheduleAlerts } from './processEmployerScheduleAlerts';
import { processScheduleAlertsForUser } from './scheduleNotifications';

const SCHEDULE_INTERVAL_MS = 5 * 60 * 1000;
const WEEKLY_DIGEST_HOUR_UTC = 9;

let scheduleTimer: ReturnType<typeof setInterval> | null = null;

export function weeklyDigestJobKey(now: Date): string {
  return `weekly_digest:${weeklyRunKey(now)}`;
}

export async function processAllScheduleAlerts(): Promise<void> {
  const seekerIds = await prisma.reminder.findMany({
    where: { status: 'PENDING', remindAt: { lte: new Date() }, notifiedAt: null },
    select: { jobApplication: { select: { userId: true } } },
    distinct: ['jobApplicationId'],
  });

  const interviewSeekerIds = await prisma.interview.findMany({
    where: { scheduledAt: { lte: new Date() }, notifiedAt: null },
    select: { jobApplication: { select: { userId: true } } },
    distinct: ['jobApplicationId'],
  });

  const userIds = new Set<string>();
  for (const row of seekerIds) userIds.add(row.jobApplication.userId);
  for (const row of interviewSeekerIds) userIds.add(row.jobApplication.userId);

  await Promise.all([...userIds].map((userId) => processScheduleAlertsForUser(userId)));
  await processEmployerScheduleAlerts();
}

async function buildWeeklyDigestBody(userId: string, since: Date): Promise<string> {
  const profile = await prisma.employerProfile.findUnique({
    where: { userId },
    select: { companyId: true },
  });
  if (!profile) return 'No hiring activity this week.';

  const companyId = profile.companyId;

  const [newApps, statusEvents, messages] = await Promise.all([
    prisma.jobApplication.count({
      where: {
        companyId,
        jobListingId: { not: null },
        appliedAt: { gte: since },
      },
    }),
    prisma.jobApplicationStatusEvent.count({
      where: {
        at: { gte: since },
        jobApplication: { companyId, jobListingId: { not: null } },
      },
    }),
    prisma.applicationMessage.count({
      where: {
        createdAt: { gte: since },
        thread: { jobApplication: { companyId, jobListingId: { not: null } } },
      },
    }),
  ]);

  return [
    `New applications: ${newApps}`,
    `Status updates: ${statusEvents}`,
    `New messages: ${messages}`,
  ].join('\n');
}

export async function sendWeeklyEmployerDigests(): Promise<void> {
  const now = new Date();
  const weekStart = getMondayUtcWeekStart(now);
  const since = new Date(weekStart);
  since.setUTCDate(since.getUTCDate() - 7);

  const employers = await prisma.user.findMany({
    where: { role: 'EMPLOYER' },
    select: { id: true },
  });

  for (const employer of employers) {
    if (!(await shouldSendWeeklySummary(employer.id))) continue;

    const existing = await prisma.weeklyDigestLog.findUnique({
      where: { userId_weekStart: { userId: employer.id, weekStart } },
    });
    if (existing) continue;

    const body = await buildWeeklyDigestBody(employer.id, since);
    await deliverDigestChannels({
      userId: employer.id,
      title: 'Your weekly hiring summary',
      body,
      urlPath: '/dashboard/employer',
    });

    await prisma.weeklyDigestLog.create({
      data: { userId: employer.id, weekStart },
    });
  }
}

function weeklyRunKey(now: Date): string {
  const weekStart = getMondayUtcWeekStart(now);
  return `${weekStart.toISOString()}-${WEEKLY_DIGEST_HOUR_UTC}`;
}

async function maybeRunWeeklyDigest(): Promise<void> {
  const now = new Date();
  if (now.getUTCDay() !== 1) return;
  if (now.getUTCHours() !== WEEKLY_DIGEST_HOUR_UTC) return;

  const key = weeklyDigestJobKey(now);
  const acquired = await tryAcquireBackgroundJobRun(key);
  if (!acquired) return;

  await sendWeeklyEmployerDigests();
}

export function startNotificationJobs(): void {
  if (scheduleTimer) return;

  void processAllScheduleAlerts().catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Initial schedule job failed:', e);
  });

  scheduleTimer = setInterval(() => {
    void processAllScheduleAlerts().catch((e) => {
      // eslint-disable-next-line no-console
      console.error('Schedule job failed:', e);
    });
    void maybeRunWeeklyDigest().catch((e) => {
      // eslint-disable-next-line no-console
      console.error('Weekly digest job failed:', e);
    });
  }, SCHEDULE_INTERVAL_MS);
}

export function stopNotificationJobs(): void {
  if (scheduleTimer) {
    clearInterval(scheduleTimer);
    scheduleTimer = null;
  }
}
