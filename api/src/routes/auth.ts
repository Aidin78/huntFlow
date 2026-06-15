import { Router } from 'express';
import { prisma, UserRole } from '@huntflow/db';
import { z } from 'zod';

import { sendError } from '../lib/errors';
import { signAccessToken } from '../lib/jwt';
import { hashPassword, verifyPassword } from '../lib/password';
import { requireAuth } from '../middleware/requireAuth';

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  name: z.string().trim().max(120).optional(),
  role: z.nativeEnum(UserRole).default(UserRole.JOB_SEEKER),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
  role: z.nativeEnum(UserRole),
});

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  const { email, password, name, role } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name?.length ? name : undefined,
        role,
        notificationPreferences: { create: {} },
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    let token: string;
    try {
      token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const hint =
        e instanceof Error && e.message.includes('JWT_SECRET')
          ? 'Set JWT_SECRET in the repo root .env (at least 16 characters), then restart the API.'
          : 'Server misconfiguration';
      sendError(res, 500, 'INTERNAL_ERROR', hint);
      return;
    }

    res.status(201).json({ user, token });
  } catch (e: unknown) {
    if (isPrismaUniqueViolation(e)) {
      sendError(res, 409, 'CONFLICT', 'Email already in use');
      return;
    }
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not create user');
  }
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  const { email, password, role: selectedRole } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, passwordHash: true, createdAt: true },
  });

  if (!user) {
    sendError(res, 401, 'UNAUTHORIZED', 'Invalid email or password');
    return;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    sendError(res, 401, 'UNAUTHORIZED', 'Invalid email or password');
    return;
  }

  if (user.role !== selectedRole) {
    sendError(
      res,
      403,
      'FORBIDDEN',
      user.role === UserRole.EMPLOYER
        ? 'This account is registered as an employer. Select "Employer" above, then sign in again.'
        : 'This account is registered as a job seeker. Select "Job seeker" above, then sign in again.',
    );
    return;
  }

  let token: string;
  try {
    token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    const hint =
      e instanceof Error && e.message.includes('JWT_SECRET')
        ? 'Set JWT_SECRET in the repo root .env (at least 16 characters), then restart the API.'
        : 'Server misconfiguration';
    sendError(res, 500, 'INTERNAL_ERROR', hint);
    return;
  }

  const { passwordHash: _omit, ...safeUser } = user;
  res.status(200).json({ user: safeUser, token });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    sendError(res, 401, 'UNAUTHORIZED', 'User no longer exists');
    return;
  }

  res.status(200).json({ user });
});

authRouter.post('/logout', (_req, res) => {
  res.status(204).send();
});

function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'P2002'
  );
}
