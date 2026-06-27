import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import { processEmployerScheduleAlerts } from './processEmployerScheduleAlerts';
import { resetDatabase, seedMinimalFixtures } from '../test/helpers';

describe('processEmployerScheduleAlerts', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('notifies employers about due interviews on board applications', async () => {
    const fx = await seedMinimalFixtures();

    const interview = await prisma.interview.create({
      data: {
        jobApplicationId: fx.application.id,
        title: 'Panel',
        scheduledAt: new Date(Date.now() - 60_000),
      },
    });

    const result = await processEmployerScheduleAlerts();
    expect(result.interviews).toBe(1);

    const notif = await prisma.notification.findFirst({
      where: {
        recipientUserId: fx.employer.id,
        type: 'INTERVIEW_UPCOMING',
      },
    });
    expect(notif).not.toBeNull();

    const updated = await prisma.interview.findUnique({ where: { id: interview.id } });
    expect(updated?.employerNotifiedAt).not.toBeNull();
  });
});
