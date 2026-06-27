import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';

describe('push subscriptions', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns 503 when VAPID is not configured', async () => {
    const prev = process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PUBLIC_KEY;

    const res = await getTestAgent().get('/api/push/vapid-public-key');
    expect(res.status).toBe(503);

    if (prev) process.env.VAPID_PUBLIC_KEY = prev;
  });

  it('saves subscription for authenticated user', async () => {
    process.env.VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa1l9aT0XjF5w';
    process.env.VAPID_PRIVATE_KEY = 'UUxIko2XaD3Q8jV1n8K9mP4rS6tU7vW8xY9zA0bC1dE';

    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .post('/api/push/subscribe')
      .set(authHeader(fx.seeker.token))
      .send({
        endpoint: 'https://push.example.com/sub/abc',
        keys: { p256dh: 'key', auth: 'auth' },
      });

    expect(res.status).toBe(201);

    const row = await prisma.pushSubscription.findUnique({
      where: { endpoint: 'https://push.example.com/sub/abc' },
    });
    expect(row?.userId).toBe(fx.seeker.id);
  });
});
