import jwt from 'jsonwebtoken';

export type AccessTokenPayload = {
  sub: string;
  email: string;
};

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
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
  return jwt.sign({ sub: payload.sub, email: payload.email }, getSecret(), options);
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
  return { sub, email };
}
