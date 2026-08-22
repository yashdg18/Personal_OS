import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { requireVaultUnlocked } from '../middleware/vaultAuth.js';
import { createSecret, deleteSecret, listSecrets, setupVault, unlockVault, updateSecret } from '../controllers/vaultController.js';

const router = Router();
router.use(requireAuth);
router.post('/setup', asyncHandler(setupVault));
router.post('/unlock', asyncHandler(unlockVault));
router.use(requireVaultUnlocked);
router.get('/', asyncHandler(listSecrets));
router.post('/', asyncHandler(createSecret));
router.patch('/:id', asyncHandler(updateSecret));
router.delete('/:id', asyncHandler(deleteSecret));

export default router;
