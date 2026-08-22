import { AppError } from './appError.js';
import { env } from '../config/env.js';
import jwt from 'jsonwebtoken';

export const APP_GATE_COOKIE = 'personal_os_gate';

export function signAppGateToken() {
  return jwt.sign({ purpose: 'app-gate' }, env.jwtSecret, { expiresIn: '12h' });
}

export function verifyAppGateToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function appGateCookieOptions() {
  const isProd = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    domain: env.cookieDomain,
    maxAge: 12 * 60 * 60 * 1000,
    path: '/',
  };
}

export function setAppGateCookie(res) {
  res.cookie(APP_GATE_COOKIE, signAppGateToken(), appGateCookieOptions());
}

export function clearAppGateCookie(res) {
  res.clearCookie(APP_GATE_COOKIE, { ...appGateCookieOptions(), maxAge: undefined });
}

export function hasValidAppGate(req) {
  const token = req.cookies?.[APP_GATE_COOKIE];
  if (!token) return false;

  try {
    const payload = verifyAppGateToken(token);
    return payload?.purpose === 'app-gate';
  } catch {
    return false;
  }
}

export function requireAppGate(req, _res, next) {
  if (!hasValidAppGate(req)) {
    return next(new AppError('Unlock the private app gate first.', 423, 'APP_GATE_REQUIRED'));
  }
  next();
}
