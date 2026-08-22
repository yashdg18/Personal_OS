import crypto from 'node:crypto';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import AppAccessCredential from '../models/AppAccessCredential.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import {
  appGateCookieOptions,
  clearAppGateCookie,
  hasValidAppGate,
  setAppGateCookie,
} from '../utils/appGate.js';

function sameSecret(input, expected) {
  const inputBuffer = Buffer.from(String(input || ''));
  const expectedBuffer = Buffer.from(expected);
  return inputBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}

function rpIdForRequest(req) {
  return env.webauthnRpId || req.hostname;
}

function expectedOrigins() {
  return env.clientUrls;
}

function credentialForVerification(credential) {
  return {
    id: credential.credentialId,
    publicKey: new Uint8Array(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports,
  };
}

export function accessStatus(req, res) {
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, data: { unlocked: hasValidAppGate(req) } });
}

export function unlockWithPassword(req, res) {
  if (!sameSecret(req.body?.password, env.appAccessPassword)) {
    throw new AppError('That private passcode is not correct.', 401, 'INVALID_APP_GATE_PASSWORD');
  }

  setAppGateCookie(res);
  res.json({ success: true, data: { unlocked: true } });
}

export function lockApp(_req, res) {
  clearAppGateCookie(res);
  res.json({ success: true, data: { unlocked: false } });
}

export async function passkeyStatus(_req, res) {
  res.set('Cache-Control', 'no-store');
  const count = await AppAccessCredential.countDocuments();
  res.json({ success: true, data: { count, configured: count > 0 } });
}

export async function passkeyRegistrationOptions(req, res) {
  const credentials = await AppAccessCredential.find().select('credentialId transports');
  const options = await generateRegistrationOptions({
    rpName: 'My Personal OS',
    rpID: rpIdForRequest(req),
    userName: 'yash',
    userDisplayName: 'Yash',
    attestationType: 'none',
    excludeCredentials: credentials.map((credential) => ({ id: credential.credentialId, transports: credential.transports })),
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'required',
      userVerification: 'required',
    },
    preferredAuthenticatorType: 'localDevice',
  });

  req.app.locals.appAccessRegistrationChallenge = options.challenge;
  res.json({ success: true, data: { options } });
}

export async function passkeyRegistrationVerify(req, res) {
  const expectedChallenge = req.app.locals.appAccessRegistrationChallenge;
  if (!expectedChallenge) throw new AppError('The biometric setup session expired. Try again.', 400, 'PASSKEY_CHALLENGE_EXPIRED');

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: expectedOrigins(),
      expectedRPID: rpIdForRequest(req),
      requireUserVerification: true,
    });
  } catch (error) {
    throw new AppError(error.message || 'Biometric setup could not be verified.', 400, 'PASSKEY_REGISTRATION_FAILED');
  } finally {
    delete req.app.locals.appAccessRegistrationChallenge;
  }

  if (!verification.verified || !verification.registrationInfo?.credential) {
    throw new AppError('Biometric setup could not be verified.', 400, 'PASSKEY_REGISTRATION_FAILED');
  }

  const { credential } = verification.registrationInfo;
  await AppAccessCredential.create({
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports,
    label: 'This device',
  });
  setAppGateCookie(res);
  res.json({ success: true, data: { unlocked: true, configured: true } });
}

export async function passkeyAuthenticationOptions(req, res) {
  const credentials = await AppAccessCredential.find().select('credentialId transports');
  if (credentials.length === 0) throw new AppError('Set up biometric unlock after entering the private passcode.', 404, 'PASSKEY_NOT_CONFIGURED');

  const options = await generateAuthenticationOptions({
    rpID: rpIdForRequest(req),
    allowCredentials: credentials.map((credential) => ({ id: credential.credentialId, transports: credential.transports })),
    userVerification: 'required',
  });

  req.app.locals.appAccessAuthenticationChallenge = options.challenge;
  res.json({ success: true, data: { options } });
}

export async function passkeyAuthenticationVerify(req, res) {
  const expectedChallenge = req.app.locals.appAccessAuthenticationChallenge;
  if (!expectedChallenge) throw new AppError('The biometric unlock session expired. Try again.', 400, 'PASSKEY_CHALLENGE_EXPIRED');

  const credential = await AppAccessCredential.findOne({ credentialId: req.body?.id });
  if (!credential) throw new AppError('This device is not registered for biometric unlock.', 401, 'PASSKEY_NOT_REGISTERED');

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: expectedOrigins(),
      expectedRPID: rpIdForRequest(req),
      credential: credentialForVerification(credential),
      requireUserVerification: true,
    });
  } catch (error) {
    throw new AppError(error.message || 'Biometric unlock could not be verified.', 401, 'PASSKEY_AUTHENTICATION_FAILED');
  } finally {
    delete req.app.locals.appAccessAuthenticationChallenge;
  }

  if (!verification.verified) throw new AppError('Biometric unlock could not be verified.', 401, 'PASSKEY_AUTHENTICATION_FAILED');

  credential.counter = verification.authenticationInfo.newCounter;
  credential.lastUsedAt = new Date();
  await credential.save();
  setAppGateCookie(res);
  res.json({ success: true, data: { unlocked: true } });
}
