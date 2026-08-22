import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { ACCESS_COOKIE, accessCookieOptions, signAccessToken } from '../utils/jwt.js';

function setSessionCookie(res, userId) {
  res.cookie(ACCESS_COOKIE, signAccessToken(userId), accessCookieOptions());
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('An account with this email already exists.', 409, 'EMAIL_IN_USE');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  setSessionCookie(res, user._id.toString());
  res.status(201).json({ success: true, data: { user: user.toSafeObject() } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Email or password is incorrect.', 401, 'INVALID_CREDENTIALS');
  }

  setSessionCookie(res, user._id.toString());
  res.json({ success: true, data: { user: user.toSafeObject() } });
}

export function logout(_req, res) {
  res.clearCookie(ACCESS_COOKIE, { ...accessCookieOptions(), maxAge: undefined });
  res.json({ success: true, data: { message: 'Signed out.' } });
}

export function me(req, res) {
  res.json({ success: true, data: { user: req.user.toSafeObject() } });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect.', 401, 'INVALID_PASSWORD');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  setSessionCookie(res, user._id.toString());
  res.json({ success: true, data: { message: 'Password updated.' } });
}

export async function forgotPassword(req, res) {
  const genericResponse = { success: true, data: { message: 'If an account matches, reset instructions will be sent.' } };
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json(genericResponse);

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // A mail provider will deliver rawToken in a later deployment phase. It is never returned from this API.
  res.json(genericResponse);
}

export async function resetPassword(req, res) {
  const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt');
  if (!user) throw new AppError('Reset token is invalid or expired.', 400, 'INVALID_RESET_TOKEN');

  user.passwordHash = await bcrypt.hash(req.body.password, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  setSessionCookie(res, user._id.toString());
  res.json({ success: true, data: { message: 'Password reset.' } });
}

