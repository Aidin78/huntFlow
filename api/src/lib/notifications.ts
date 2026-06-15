import { prisma, UserRole } from '@huntflow/db';

export type NotificationKind = 'NEW_APPLICATION' | 'NEW_MESSAGE' | 'STATUS_EVENT';

export type NotificationTypeValue = 'MESSAGE' | 'NEW_APPLICATION' | 'STATUS_EVENT';

export type CreateNotificationInput = {
  recipientUserId: string;
  type: NotificationTypeValue;
  title: string;
  body?: string | null;
  actorUserId?: string | null;
  jobApplicationId?: string | null;
  messageId?: string | null;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function ensureNotificationPreferences(userId: string) {
  return prisma.userNotificationPreferences.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function shouldNotify(userId: string, kind: NotificationKind): Promise<boolean> {
  const prefs = await ensureNotificationPreferences(userId);
  switch (kind) {
    case 'NEW_APPLICATION':
      return prefs.notifyNewApplication;
    case 'NEW_MESSAGE':
      return prefs.notifyNewMessage;
    case 'STATUS_EVENT':
      return true;
    default:
      return true;
  }
}

export async function getCompanyEmployerUserIds(companyId: string): Promise<string[]> {
  const rows = await prisma.employerProfile.findMany({
    where: { companyId },
    select: { userId: true },
  });
  return rows.map((r) => r.userId);
}

function notificationHref(role: UserRole, jobApplicationId: string | null): string | null {
  if (!jobApplicationId) return null;
  if (role === UserRole.EMPLOYER) {
    return `/dashboard/employer/applications/${jobApplicationId}?tab=messages`;
  }
  return `/dashboard/seeker/applications/${jobApplicationId}?tab=messages`;
}

function mapNotification(
  row: {
    id: string;
    type: NotificationTypeValue;
    title: string;
    body: string | null;
    createdAt: Date;
    readAt: Date | null;
    jobApplicationId: string | null;
    actor: { id: string; name: string | null; email: string } | null;
  },
  recipientRole: UserRole,
) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt?.toISOString() ?? null,
    jobApplicationId: row.jobApplicationId,
    href: notificationHref(recipientRole, row.jobApplicationId),
    actor: row.actor
      ? { id: row.actor.id, name: row.actor.name, email: row.actor.email }
      : null,
  };
}

export async function createNotification(input: CreateNotificationInput) {
  const row = await prisma.notification.create({
    data: {
      recipientUserId: input.recipientUserId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      actorUserId: input.actorUserId ?? null,
      jobApplicationId: input.jobApplicationId ?? null,
      messageId: input.messageId ?? null,
    },
    select: { id: true },
  });
  return row;
}

export async function createNotificationIfEnabled(
  userId: string,
  kind: NotificationKind,
  input: Omit<CreateNotificationInput, 'recipientUserId'>,
) {
  if (!(await shouldNotify(userId, kind))) return;
  await createNotification({ ...input, recipientUserId: userId });
}

export async function notifyEmployersOfNewApplication(opts: {
  companyId: string;
  applicationId: string;
  applicationTitle: string;
  applicantName: string | null;
  applicantEmail: string;
  actorUserId: string;
}) {
  const employerIds = await getCompanyEmployerUserIds(opts.companyId);
  const applicantLabel = opts.applicantName?.trim() || opts.applicantEmail;
  const title = `New application: ${opts.applicationTitle}`;
  const body = `${applicantLabel} applied to this role.`;

  await Promise.all(
    employerIds.map((recipientUserId) =>
        createNotificationIfEnabled(recipientUserId, 'NEW_APPLICATION', {
          type: 'NEW_APPLICATION',
        title,
        body,
        actorUserId: opts.actorUserId,
        jobApplicationId: opts.applicationId,
      }),
    ),
  );
}

export async function notifyApplicationMessage(opts: {
  jobApplicationId: string;
  messageId: string;
  senderUserId: string;
  senderName: string | null;
  senderEmail: string;
  body: string;
  seekerUserId: string;
  companyId: string;
}) {
  const preview =
    opts.body.length > 120 ? `${opts.body.slice(0, 117)}…` : opts.body;
  const senderLabel = opts.senderName?.trim() || opts.senderEmail;

  if (opts.senderUserId === opts.seekerUserId) {
    const employerIds = await getCompanyEmployerUserIds(opts.companyId);
    const title = `New message from ${senderLabel}`;
    await Promise.all(
      employerIds.map((recipientUserId) =>
        createNotificationIfEnabled(recipientUserId, 'NEW_MESSAGE', {
          type: 'MESSAGE',
          title,
          body: preview,
          actorUserId: opts.senderUserId,
          jobApplicationId: opts.jobApplicationId,
          messageId: opts.messageId,
        }),
      ),
    );
    return;
  }

  const title = `New message from ${senderLabel}`;
  await createNotificationIfEnabled(opts.seekerUserId, 'NEW_MESSAGE', {
    type: 'MESSAGE',
    title,
    body: preview,
    actorUserId: opts.senderUserId,
    jobApplicationId: opts.jobApplicationId,
    messageId: opts.messageId,
  });
}

export async function listNotifications(
  userId: string,
  recipientRole: UserRole,
  opts: { cursor?: string; limit?: number },
) {
  const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

  const rows = await prisma.notification.findMany({
    where: { recipientUserId: userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      createdAt: true,
      readAt: true,
      jobApplicationId: true,
      actor: { select: { id: true, name: true, email: true } },
    },
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;
  const unreadCount = await getUnreadCount(userId);

  return {
    items: page.map((row) => mapNotification(row, recipientRole)),
    unreadCount,
    nextCursor,
    hasMore,
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { recipientUserId: userId, readAt: null },
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, recipientUserId: userId, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count > 0;
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { recipientUserId: userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export const notificationPreferencesSelect = {
  notifyNewApplication: true,
  notifyNewMessage: true,
  notifyInterviewReminder: true,
  notifyWeeklySummary: true,
  updatedAt: true,
} as const;

export function mapNotificationPreferences(row: {
  notifyNewApplication: boolean;
  notifyNewMessage: boolean;
  notifyInterviewReminder: boolean;
  notifyWeeklySummary: boolean;
  updatedAt: Date;
}) {
  return {
    notifyNewApplication: row.notifyNewApplication,
    notifyNewMessage: row.notifyNewMessage,
    notifyInterviewReminder: row.notifyInterviewReminder,
    notifyWeeklySummary: row.notifyWeeklySummary,
    updatedAt: row.updatedAt.toISOString(),
  };
}
