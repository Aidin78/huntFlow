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

  it('returns seeker application link without messages tab for status events', () => {
    expect(buildNotificationHref(UserRole.JOB_SEEKER, 'app-1', 'STATUS_EVENT')).toBe(
      '/dashboard/seeker/applications/app-1',
    );
  });

  it('returns seeker application link for schedule alerts', () => {
    expect(buildNotificationHref(UserRole.JOB_SEEKER, 'app-1', 'REMINDER_DUE')).toBe(
      '/dashboard/seeker/applications/app-1',
    );
    expect(buildNotificationHref(UserRole.JOB_SEEKER, 'app-1', 'INTERVIEW_UPCOMING')).toBe(
      '/dashboard/seeker/applications/app-1',
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
      notifyStatusEvent: true,
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
      notifyStatusEvent: true,
      updatedAt: new Date(),
    });

    expect(await shouldNotify('u1', 'NEW_MESSAGE')).toBe(false);
  });

  it('respects notifyStatusEvent preference', async () => {
    vi.mocked(prisma.userNotificationPreferences.upsert).mockResolvedValue({
      userId: 'u1',
      notifyNewApplication: true,
      notifyNewMessage: true,
      notifyInterviewReminder: true,
      notifyWeeklySummary: false,
      notifyStatusEvent: false,
      updatedAt: new Date(),
    });

    expect(await shouldNotify('u1', 'STATUS_EVENT')).toBe(false);
  });

  it('respects notifyInterviewReminder for schedule alerts', async () => {
    vi.mocked(prisma.userNotificationPreferences.upsert).mockResolvedValue({
      userId: 'u1',
      notifyNewApplication: true,
      notifyNewMessage: true,
      notifyInterviewReminder: false,
      notifyWeeklySummary: false,
      notifyStatusEvent: true,
      updatedAt: new Date(),
    });

    expect(await shouldNotify('u1', 'REMINDER_DUE')).toBe(false);
    expect(await shouldNotify('u1', 'INTERVIEW_UPCOMING')).toBe(false);
  });
});
