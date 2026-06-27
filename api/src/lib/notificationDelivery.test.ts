import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetDatabase } from '../test/helpers';
import { deliverNotificationChannels } from './notificationDelivery';
import { createNotification } from './notifications';

const sendEmail = vi.fn().mockResolvedValue(true);

vi.mock('./email', () => ({
  sendEmail: (...args: unknown[]) => sendEmail(...args),
  absoluteAppUrl: (path: string | null) => (path ? `http://localhost:3000${path}` : null),
}));

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('notificationDelivery', () => {
  beforeEach(async () => {
    sendEmail.mockClear();
    await resetDatabase();
  });

  it('sends email when notification is created', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'notify@test.huntflow.app',
        passwordHash: 'hash',
        role: 'JOB_SEEKER',
        notificationPreferences: { create: {} },
      },
    });

    const row = await createNotification({
      recipientUserId: user.id,
      type: 'MESSAGE',
      title: 'Hello',
      body: 'Preview',
    });

    await deliverNotificationChannels({
      notificationId: row.id,
      recipientUserId: user.id,
      kind: 'NEW_MESSAGE',
      type: 'MESSAGE',
      title: 'Hello',
      body: 'Preview',
      jobApplicationId: null,
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'notify@test.huntflow.app',
        subject: 'Hello',
      }),
    );

    const updated = await prisma.notification.findUnique({ where: { id: row.id } });
    expect(updated?.emailSentAt).not.toBeNull();
  });
});
