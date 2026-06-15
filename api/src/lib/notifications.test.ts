import { UserRole } from '@huntflow/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildNotificationHref, shouldNotify } from './notifications';

vi.mock('@huntflow/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@huntflow/db')>();
  return {
    ...actual,
    prisma: {
      userNotificationPreferences: {
        upsert: vi.fn(),
      },
    },
  };
});

import { prisma } from '@huntflow/db';

describe('buildNotificationHref', () => {
  it('returns employer application link', () => {
    expect(buildNotificationHref(UserRole.EMPLOYER, 'app-1')).toBe(
      '/dashboard/employer/applications/app-1?tab=messages',
    );
  });

  it('returns seeker application link', () => {
    expect(buildNotificationHref(UserRole.JOB_SEEKER, 'app-1')).toBe(
      '/dashboard/seeker/applications/app-1?tab=messages',
    );
  });

  it('returns null without application id', () => {
    expect(buildNotificationHref(UserRole.EMPLOYER, null)).toBeNull();
  });
});

describe('shouldNotify', () => {
  beforeEach(() => {
    vi.mocked(prisma.userNotificationPreferences.upsert).mockReset();
  });

  it('respects notifyNewApplication preference', async () => {
    vi.mocked(prisma.userNotificationPreferences.upsert).mockResolvedValue({
      userId: 'u1',
      notifyNewApplication: false,
      notifyNewMessage: true,
      notifyInterviewReminder: true,
      notifyWeeklySummary: false,
      updatedAt: new Date(),
    });

    expect(await shouldNotify('u1', 'NEW_APPLICATION')).toBe(false);
  });

  it('respects notifyNewMessage preference', async () => {
    vi.mocked(prisma.userNotificationPreferences.upsert).mockResolvedValue({
      userId: 'u1',
      notifyNewApplication: true,
      notifyNewMessage: false,
      notifyInterviewReminder: true,
      notifyWeeklySummary: false,
      updatedAt: new Date(),
    });

    expect(await shouldNotify('u1', 'NEW_MESSAGE')).toBe(false);
  });
});
