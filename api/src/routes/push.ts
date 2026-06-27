import { Router } from 'express';
import { prisma } from '@huntflow/db';
import { z } from 'zod';

import { sendError } from '../lib/errors';
import { getVapidPublicKey } from '../lib/notificationDelivery';
import { requireAuth } from '../middleware/requireAuth';

const subscribeBodySchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
});

const unsubscribeBodySchema = z.object({
  endpoint: z.string().url().max(2000),
});

export const pushRouter = Router();

pushRouter.get('/push/vapid-public-key', (_req, res) => {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Web push is not configured');
    return;
  }
  res.json({ publicKey });
});

pushRouter.post('/push/subscribe', requireAuth, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const parsed = subscribeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid subscription', parsed.error.flatten());
    return;
  }

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: parsed.data.endpoint },
      create: {
        userId,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
      },
      update: {
        userId,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
      },
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not save subscription');
  }
});

pushRouter.delete('/push/subscribe', requireAuth, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const parsed = unsubscribeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    await prisma.pushSubscription.deleteMany({
      where: { userId, endpoint: parsed.data.endpoint },
    });
    res.status(204).send();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not remove subscription');
  }
});
