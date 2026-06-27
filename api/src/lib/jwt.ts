import jwt from 'jsonwebtoken';

import type { UserRole } from '@huntflow/db';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

function getSecret(): string {
  const raw = process.env.JWT_SECRET;
  const secret =
    typeof raw === 'string'
      ? raw.trim().replace(/^["']|["']$/g, '')
      : '';
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET must be set and at least 16 characters long');
  }
  return secret;
}

export function signAccessToken(payload: AccessTokenPayload, expiresInSeconds = 7 * 24 * 60 * 60): string {
  const options: jwt.SignOptions = {
    algorithm: 'HS256',
    expiresIn: expiresInSeconds,
  };
  return jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role },
    getSecret(),
    options,
  );
}

function parseRole(raw: unknown): UserRole {
  if (raw === 'EMPLOYER') {
    return 'EMPLOYER';
  }
  if (raw === 'PLATFORM_ADMIN') {
    return 'PLATFORM_ADMIN';
  }
  return 'JOB_SEEKER';
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Invalid token payload');
  }
  const sub = (decoded as jwt.JwtPayload).sub;
  const email = (decoded as jwt.JwtPayload).email;
  if (typeof sub !== 'string' || typeof email !== 'string') {
    throw new Error('Invalid token payload');
  }
  const role = parseRole((decoded as jwt.JwtPayload).role);
  return { sub, email, role };
}
