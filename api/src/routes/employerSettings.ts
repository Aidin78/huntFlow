import { Router } from 'express';
import { prisma } from '@huntflow/db';
import { z } from 'zod';

import {
  ensureNotificationPreferences,
  mapNotificationPreferences,
  notificationPreferencesSelect,
} from '../lib/notifications';
import { sendError } from '../lib/errors';
import { requireEmployer } from '../middleware/requireEmployer';

const preferencesBodySchema = z
  .object({
    notifyNewApplication: z.boolean().optional(),
    notifyNewMessage: z.boolean().optional(),
    notifyInterviewReminder: z.boolean().optional(),
    notifyWeeklySummary: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'At least one field is required');

export const employerSettingsRouter = Router();

employerSettingsRouter.use('/employer', requireEmployer);

employerSettingsRouter.get('/employer/notification-preferences', async (req, res) => {
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

employerSettingsRouter.patch('/employer/notification-preferences', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const parsed = preferencesBodySchema.safeParse(req.body);
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
