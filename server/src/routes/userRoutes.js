import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = Router();
router.use(requireAuth);
router.get('/me', asyncHandler(getProfile));
router.patch('/me', asyncHandler(updateProfile));

export default router;
