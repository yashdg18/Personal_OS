import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAppGate } from '../utils/appGate.js';
import {
  accessStatus,
  lockApp,
  passkeyAuthenticationOptions,
  passkeyAuthenticationVerify,
  passkeyRegistrationOptions,
  passkeyRegistrationVerify,
  passkeyStatus,
  unlockWithPassword,
} from '../controllers/accessController.js';

const router = Router();

router.get('/status', asyncHandler(accessStatus));
router.post('/unlock', asyncHandler(unlockWithPassword));
router.post('/lock', asyncHandler(lockApp));
router.get('/passkey/status', asyncHandler(passkeyStatus));
router.post('/passkey/register/options', requireAuth, requireAppGate, asyncHandler(passkeyRegistrationOptions));
router.post('/passkey/register/verify', requireAuth, requireAppGate, asyncHandler(passkeyRegistrationVerify));
router.post('/passkey/authenticate/options', asyncHandler(passkeyAuthenticationOptions));
router.post('/passkey/authenticate/verify', asyncHandler(passkeyAuthenticationVerify));

export default router;
