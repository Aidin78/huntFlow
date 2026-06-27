import { createHash, randomBytes } from 'crypto';

import { prisma } from '@huntflow/db';

import { absoluteAppUrl, sendEmail } from './email';
import { hashPassword } from './password';

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createPasswordResetToken(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true },
  });
  if (!user) return;

  const token = randomBytes(TOKEN_BYTES).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    }),
  ]);

  const resetUrl = absoluteAppUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  if (!resetUrl) return;

  await sendEmail({
    to: user.email,
    subject: 'Reset your huntFlow password',
    text: [
      'We received a request to reset your huntFlow password.',
      '',
      `Reset your password: ${resetUrl}`,
      '',
      'This link expires in 1 hour. If you did not request this, you can ignore this email.',
    ].join('\n'),
  });
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' }> {
  const tokenHash = hashToken(token.trim());
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!row || row.usedAt) {
    return { ok: false, code: 'INVALID_TOKEN' };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, code: 'EXPIRED_TOKEN' };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true };
}
