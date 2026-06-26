import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import { processScheduleAlertsForUser } from './scheduleNotifications';
import { resetDatabase, seedMinimalFixtures } from '../test/helpers';

describe('processScheduleAlertsForUser', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates REMINDER_DUE notification and sets notifiedAt', async () => {
    const fx = await seedMinimalFixtures();
    const past = new Date(Date.now() - 60_000);

    await prisma.reminder.create({
      data: {
        jobApplicationId: fx.application.id,
        title: 'Follow up',
        remindAt: past,
        status: 'PENDING',
      },
    });

    const result = await processScheduleAlertsForUser(fx.seeker.id);
    expect(result.reminders).toBe(1);

    const notification = await prisma.notification.findFirst({
      where: { recipientUserId: fx.seeker.id, type: 'REMINDER_DUE' },
    });
    expect(notification?.title).toContain('Follow up');

    const reminder = await prisma.reminder.findFirst({
      where: { jobApplicationId: fx.application.id },
    });
    expect(reminder?.notifiedAt).not.toBeNull();
  });

  it('is idempotent on second run', async () => {
    const fx = await seedMinimalFixtures();
    const past = new Date(Date.now() - 60_000);

    await prisma.reminder.create({
      data: {
        jobApplicationId: fx.application.id,
        title: 'Follow up',
        remindAt: past,
        status: 'PENDING',
      },
    });

    await processScheduleAlertsForUser(fx.seeker.id);
    await processScheduleAlertsForUser(fx.seeker.id);

    const count = await prisma.notification.count({
      where: { recipientUserId: fx.seeker.id, type: 'REMINDER_DUE' },
    });
    expect(count).toBe(1);
  });

  it('skips notification when pref disabled but still sets notifiedAt', async () => {
    const fx = await seedMinimalFixtures();
    const past = new Date(Date.now() - 60_000);

    await prisma.userNotificationPreferences.update({
      where: { userId: fx.seeker.id },
      data: { notifyInterviewReminder: false },
    });

    await prisma.reminder.create({
      data: {
        jobApplicationId: fx.application.id,
        title: 'Silent reminder',
        remindAt: past,
        status: 'PENDING',
      },
    });

    await processScheduleAlertsForUser(fx.seeker.id);

    const count = await prisma.notification.count({
      where: { recipientUserId: fx.seeker.id },
    });
    expect(count).toBe(0);

    const reminder = await prisma.reminder.findFirst({
      where: { jobApplicationId: fx.application.id },
    });
    expect(reminder?.notifiedAt).not.toBeNull();
  });

  it('creates INTERVIEW_UPCOMING when scheduledAt has passed', async () => {
    const fx = await seedMinimalFixtures();
    const past = new Date(Date.now() - 30_000);

    await prisma.interview.create({
      data: {
        jobApplicationId: fx.application.id,
        title: 'Tech screen',
        scheduledAt: past,
      },
    });

    const result = await processScheduleAlertsForUser(fx.seeker.id);
    expect(result.interviews).toBe(1);

    const notification = await prisma.notification.findFirst({
      where: { recipientUserId: fx.seeker.id, type: 'INTERVIEW_UPCOMING' },
    });
    expect(notification?.title).toContain('Tech screen');
  });
});
