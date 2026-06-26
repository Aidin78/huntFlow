import { Router } from 'express';
import { prisma } from '@huntflow/db';
import { z } from 'zod';

import { sendError } from '../lib/errors';
import {
  ensureNotificationPreferences,
  mapNotificationPreferences,
  notificationPreferencesSelect,
} from '../lib/notifications';
import { requireJobSeeker } from '../middleware/requireJobSeeker';

const seekerPreferencesBodySchema = z
  .object({
    notifyNewMessage: z.boolean().optional(),
    notifyInterviewReminder: z.boolean().optional(),
    notifyStatusEvent: z.boolean().optional(),
    notifyNewApplication: z.boolean().optional(),
    notifyWeeklySummary: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'At least one field is required')
  .transform((data) => ({
    ...(data.notifyNewMessage !== undefined ? { notifyNewMessage: data.notifyNewMessage } : {}),
    ...(data.notifyInterviewReminder !== undefined
      ? { notifyInterviewReminder: data.notifyInterviewReminder }
      : {}),
    ...(data.notifyStatusEvent !== undefined ? { notifyStatusEvent: data.notifyStatusEvent } : {}),
  }))
  .refine((data) => Object.keys(data).length > 0, 'At least one seeker preference field is required');

export const seekerSettingsRouter = Router();

seekerSettingsRouter.use('/seeker', requireJobSeeker);

seekerSettingsRouter.get('/seeker/notification-preferences', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  try {
    const prefs = await ensureNotificationPreferences(userId);
    res.json(mapNotificationPreferences(prefs));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load notification preferences');
  }
});

seekerSettingsRouter.patch('/seeker/notification-preferences', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const parsed = seekerPreferencesBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid preferences', parsed.error.flatten());
    return;
  }

  try {
    await ensureNotificationPreferences(userId);
    const updated = await prisma.userNotificationPreferences.update({
      where: { userId },
      data: parsed.data,
      select: notificationPreferencesSelect,
    });
    res.json(mapNotificationPreferences(updated));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not save notification preferences');
  }
});
