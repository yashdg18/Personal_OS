import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const ACCESS_COOKIE = 'personal_os_access';

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function signVaultToken(userId) {
  return jwt.sign({ sub: userId, purpose: 'vault' }, env.jwtSecret, { expiresIn: '30m' });
}

export function verifyVaultToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    domain: env.cookieDomain,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}
