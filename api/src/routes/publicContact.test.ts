import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTestAgent, resetDatabase, seedMinimalFixtures } from '../test/helpers';
import { resetRateLimitForTests } from '../lib/rateLimit';

describe('POST /api/public/contact', () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimitForTests();
    vi.restoreAllMocks();
    delete process.env.RESEND_API_KEY;
    delete process.env.SUPPORT_INBOX_EMAIL;
  });

  it('creates a support inquiry without auth', async () => {
    const res = await getTestAgent().post('/api/public/contact').send({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      subject: 'Account help',
      message: 'I need help with my pipeline.',
    });

    expect(res.status).toBe(201);
    expect(res.body.inquiry.id).toBeTruthy();

    const count = await prisma.supportInquiry.count();
    expect(count).toBe(1);
  });

  it('accepts honeypot silently without persisting', async () => {
    const res = await getTestAgent().post('/api/public/contact').send({
      name: 'Spammer',
      email: 'spam@example.com',
      subject: 'Buy now',
      message: 'Spam body',
      website: 'https://spam.example',
    });

    expect(res.status).toBe(201);
    const count = await prisma.supportInquiry.count();
    expect(count).toBe(0);
  });

  it('returns 400 for invalid body', async () => {
    const res = await getTestAgent().post('/api/public/contact').send({
      name: '',
      email: 'not-an-email',
      subject: '',
      message: '',
    });

    expect(res.status).toBe(400);
  });

  it('returns 429 after rate limit exceeded', async () => {
    const agent = getTestAgent();
    const body = {
      name: 'Rate Test',
      email: 'rate@example.com',
      subject: 'Hello',
      message: 'Testing rate limit',
    };

    for (let i = 0; i < 5; i += 1) {
      const res = await agent.post('/api/public/contact').send(body);
      expect(res.status).toBe(201);
    }

    const blocked = await agent.post('/api/public/contact').send(body);
    expect(blocked.status).toBe(429);
  });

  it('links authenticated user when bearer token provided', async () => {
    const fx = await seedMinimalFixtures();

    const res = await getTestAgent()
      .post('/api/public/contact')
      .set('Authorization', `Bearer ${fx.seeker.token}`)
      .send({
        name: 'Seeker User',
        email: 'seeker@example.com',
        subject: 'Signed in question',
        message: 'Please help',
      });

    expect(res.status).toBe(201);

    const row = await prisma.supportInquiry.findFirst({
      where: { id: res.body.inquiry.id },
    });
    expect(row?.userId).toBe(fx.seeker.id);
  });

  it('calls Resend when email env is configured', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.SUPPORT_INBOX_EMAIL = 'support@huntflow.app';

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'email-1' }), { status: 200 }),
    );

    const res = await getTestAgent().post('/api/public/contact').send({
      name: 'Email Test',
      email: 'user@example.com',
      subject: 'Hello',
      message: 'Please notify support',
    });

    expect(res.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' }),
    );

    const row = await prisma.supportInquiry.findFirst({
      where: { id: res.body.inquiry.id },
    });
    expect(row?.emailSent).toBe(true);
  });
});
