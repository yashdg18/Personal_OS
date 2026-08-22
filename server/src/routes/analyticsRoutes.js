import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { getAnalyticsOverview } from '../controllers/analyticsController.js';

const router = Router();
router.get('/overview', requireAuth, asyncHandler(getAnalyticsOverview));

export default router;
