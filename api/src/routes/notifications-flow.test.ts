import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  authHeader,
  getTestAgent,
  resetDatabase,
  seedMinimalFixtures,
} from '../test/helpers';

describe('notification flows', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates employer notification when seeker applies to listing', async () => {
    const fx = await seedMinimalFixtures();

    await prisma.jobApplication.deleteMany({ where: { jobListingId: fx.listing.id } });
    await prisma.notification.deleteMany();

    const apply = await getTestAgent()
      .post(`/api/job-listings/${fx.listing.id}/apply`)
      .set(authHeader(fx.seeker.token))
      .send({ coverLetter: 'Interested in this role.' });

    expect(apply.status).toBe(201);

    const notifications = await prisma.notification.findMany({
      where: { recipientUserId: fx.employer.id, type: 'NEW_APPLICATION' },
    });
    expect(notifications.length).toBeGreaterThanOrEqual(1);
  });

  it('creates seeker notification when employer sends a message', async () => {
    const fx = await seedMinimalFixtures();

    await prisma.notification.deleteMany();

    const res = await getTestAgent()
      .post(`/api/employer/applications/${fx.application.id}/messages`)
      .set(authHeader(fx.employer.token))
      .send({ body: 'Thanks for applying — can we schedule a call?' });

    expect(res.status).toBe(201);

    const notifications = await prisma.notification.findMany({
      where: { recipientUserId: fx.seeker.id, type: 'MESSAGE' },
    });
    expect(notifications).toHaveLength(1);
  });

  it('does not create message notification when seeker disabled notifyNewMessage', async () => {
    const fx = await seedMinimalFixtures();

    await prisma.userNotificationPreferences.update({
      where: { userId: fx.seeker.id },
      data: { notifyNewMessage: false },
    });
    await prisma.notification.deleteMany();

    await getTestAgent()
      .post(`/api/employer/applications/${fx.application.id}/messages`)
      .set(authHeader(fx.employer.token))
      .send({ body: 'Hello again' });

    const count = await prisma.notification.count({
      where: { recipientUserId: fx.seeker.id },
    });
    expect(count).toBe(0);
  });
});
