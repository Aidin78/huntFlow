import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';

describe('notifications routes', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns unread notifications for employer', async () => {
    const fx = await seedMinimalFixtures();

    await prisma.notification.create({
      data: {
        type: 'NEW_APPLICATION',
        title: 'New application',
        body: 'Someone applied',
        recipientUserId: fx.employer.id,
        jobApplicationId: fx.application.id,
      },
    });

    const res = await getTestAgent()
      .get('/api/notifications')
      .set(authHeader(fx.employer.token));

    expect(res.status).toBe(200);
    expect(res.body.unreadCount).toBe(1);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].href).toContain(fx.application.id);
  });

  it('marks a notification as read', async () => {
    const fx = await seedMinimalFixtures();
    const row = await prisma.notification.create({
      data: {
        type: 'MESSAGE',
        title: 'New message',
        recipientUserId: fx.employer.id,
        jobApplicationId: fx.application.id,
      },
    });

    const patch = await getTestAgent()
      .patch(`/api/notifications/${row.id}/read`)
      .set(authHeader(fx.employer.token));

    expect(patch.status).toBe(200);

    const list = await getTestAgent()
      .get('/api/notifications')
      .set(authHeader(fx.employer.token));

    expect(list.body.unreadCount).toBe(0);
  });

  it('marks all notifications as read', async () => {
    const fx = await seedMinimalFixtures();
    await prisma.notification.createMany({
      data: [
        {
          type: 'MESSAGE',
          title: 'One',
          recipientUserId: fx.employer.id,
        },
        {
          type: 'NEW_APPLICATION',
          title: 'Two',
          recipientUserId: fx.employer.id,
        },
      ],
    });

    await getTestAgent()
      .post('/api/notifications/read-all')
      .set(authHeader(fx.employer.token));

    const count = await prisma.notification.count({
      where: { recipientUserId: fx.employer.id, readAt: null },
    });
    expect(count).toBe(0);
  });
});
