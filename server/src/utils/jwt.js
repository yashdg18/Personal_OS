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
  const isProd = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    domain: env.cookieDomain,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}
