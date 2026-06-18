import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { createContactInquiry, hashIpAddress } from '../lib/contactInquiry';
import { sendError } from '../lib/errors';
import { verifyAccessToken } from '../lib/jwt';
import { checkRateLimit } from '../lib/rateLimit';

const CONTACT_RATE_LIMIT_MAX = 5;
const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const contactBodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(4000),
  website: z.string().max(200).optional(),
});

function optionalUserIdFromRequest(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) return null;
  try {
    return verifyAccessToken(token).sub;
  } catch {
    return null;
  }
}

function clientIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim();
  }
  return req.ip;
}

export const publicContactRouter = Router();

publicContactRouter.post('/public/contact', async (req, res) => {
  const parsed = contactBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  if (parsed.data.website?.trim()) {
    res.status(201).json({ inquiry: { id: 'accepted', createdAt: new Date().toISOString() } });
    return;
  }

  const ipHash = hashIpAddress(clientIp(req));
  const rateKey = ipHash ?? 'unknown';
  const rate = checkRateLimit(rateKey, CONTACT_RATE_LIMIT_MAX, CONTACT_RATE_LIMIT_WINDOW_MS);
  if (!rate.ok) {
    res.setHeader('Retry-After', String(rate.retryAfterSeconds));
    sendError(res, 429, 'TOO_MANY_REQUESTS', 'Too many contact requests. Please try again later.');
    return;
  }

  try {
    const inquiry = await createContactInquiry(
      {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
      {
        ipHash,
        userId: optionalUserIdFromRequest(req),
      },
    );

    res.status(201).json({ inquiry });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not submit contact form');
  }
});
