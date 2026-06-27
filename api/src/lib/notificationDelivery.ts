import webpush from 'web-push';

import { prisma } from '@huntflow/db';

import { absoluteAppUrl, sendEmail } from './email';
import {
  buildNotificationHref,
  type NotificationKind,
  type NotificationTypeValue,
} from './notifications';

export type DeliverNotificationInput = {
  notificationId: string;
  recipientUserId: string;
  kind: NotificationKind;
  type: NotificationTypeValue;
  title: string;
  body?: string | null;
  jobApplicationId?: string | null;
};

export function isWebPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY?.trim() && process.env.VAPID_PRIVATE_KEY?.trim(),
  );
}

function configureWebPush(): boolean {
  if (!isWebPushConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT?.trim() || 'mailto:hello@huntflow.app',
    process.env.VAPID_PUBLIC_KEY!.trim(),
    process.env.VAPID_PRIVATE_KEY!.trim(),
  );
  return true;
}

export function getVapidPublicKey(): string | null {
  const key = process.env.VAPID_PUBLIC_KEY?.trim();
  return key || null;
}

async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url: string | null },
): Promise<boolean> {
  if (!configureWebPush()) return false;

  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { endpoint: true, p256dh: true, auth: true },
  });
  if (subs.length === 0) return false;

  const data = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url,
  });

  let anySent = false;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          data,
        );
        anySent = true;
      } catch (e) {
        const statusCode =
          typeof e === 'object' && e !== null && 'statusCode' in e
            ? (e as { statusCode: number }).statusCode
            : null;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
        }
        // eslint-disable-next-line no-console
        console.error('Web push send failed:', e);
      }
    }),
  );

  return anySent;
}

export async function deliverNotificationChannels(input: DeliverNotificationInput): Promise<void> {
  const existing = await prisma.notification.findUnique({
    where: { id: input.notificationId },
    select: { emailSentAt: true, pushSentAt: true },
  });
  if (!existing) return;

  const user = await prisma.user.findUnique({
    where: { id: input.recipientUserId },
    select: { email: true, role: true },
  });
  if (!user) return;

  const href = buildNotificationHref(user.role, input.jobApplicationId ?? null, input.type);
  const url = absoluteAppUrl(href);
  const bodyText = input.body?.trim() || '';
  const emailLines = [bodyText, '', url ? `Open in huntFlow: ${url}` : ''].filter(Boolean);

  if (!existing.emailSentAt) {
    const sent = await sendEmail({
      to: user.email,
      subject: input.title,
      text: emailLines.join('\n'),
    });
    if (sent) {
      await prisma.notification.update({
        where: { id: input.notificationId },
        data: { emailSentAt: new Date() },
      });
    }
  }

  if (!existing.pushSentAt) {
    const sent = await sendPushToUser(input.recipientUserId, {
      title: input.title,
      body: bodyText || input.title,
      url,
    });
    if (sent) {
      await prisma.notification.update({
        where: { id: input.notificationId },
        data: { pushSentAt: new Date() },
      });
    }
  }
}

export function deliverNotificationChannelsAsync(input: DeliverNotificationInput): void {
  void deliverNotificationChannels(input).catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Notification delivery failed:', e);
  });
}

export type DigestDeliveryInput = {
  userId: string;
  title: string;
  body: string;
  urlPath?: string | null;
};

export async function deliverDigestChannels(input: DigestDeliveryInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { email: true },
  });
  if (!user) return;

  const url = absoluteAppUrl(input.urlPath ?? '/dashboard/employer');
  const emailLines = [input.body, '', url ? `Open huntFlow: ${url}` : ''].filter(Boolean);

  await sendEmail({
    to: user.email,
    subject: input.title,
    text: emailLines.join('\n'),
  });

  await sendPushToUser(input.userId, {
    title: input.title,
    body: input.body,
    url,
  });
}

export async function shouldSendWeeklySummary(userId: string): Promise<boolean> {
  const prefs = await prisma.userNotificationPreferences.findUnique({
    where: { userId },
    select: { notifyWeeklySummary: true },
  });
  return prefs?.notifyWeeklySummary ?? false;
}

export function getMondayUtcWeekStart(date = new Date()): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
