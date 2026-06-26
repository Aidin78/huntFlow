import { Router } from 'express';
import { z } from 'zod';

import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/notifications';
import { processScheduleAlertsForUser } from '../lib/scheduleNotifications';
import { sendError } from '../lib/errors';
import { requireAuth } from '../middleware/requireAuth';

const notificationIdSchema = z.string().uuid();

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/notifications', async (req, res) => {
  const userId = req.userId;
  const role = req.userRole;
  if (!userId || !role) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const cursorParsed = notificationIdSchema.safeParse(req.query.cursor);
  if (req.query.cursor !== undefined && !cursorParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid cursor');
    return;
  }

  const limitParsed = z.coerce.number().int().min(1).max(50).safeParse(req.query.limit);

  try {
    if (role === 'JOB_SEEKER') {
      await processScheduleAlertsForUser(userId);
    }
    const result = await listNotifications(userId, role, {
      cursor: cursorParsed.success ? cursorParsed.data : undefined,
      limit: limitParsed.success ? limitParsed.data : undefined,
    });
    res.json(result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load notifications');
  }
});

notificationsRouter.get('/notifications/unread-count', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  try {
    const count = await getUnreadCount(userId);
    res.json({ count });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load unread count');
  }
});

notificationsRouter.patch('/notifications/:id/read', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = notificationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid notification id');
    return;
  }

  try {
    const updated = await markNotificationRead(userId, idParsed.data);
    if (!updated) {
      sendError(res, 404, 'NOT_FOUND', 'Notification not found');
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not mark notification as read');
  }
});

notificationsRouter.post('/notifications/read-all', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  try {
    await markAllNotificationsRead(userId);
    res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not mark notifications as read');
  }
});
