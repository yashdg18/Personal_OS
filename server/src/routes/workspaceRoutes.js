import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createWorkspaceItem,
  deleteWorkspaceItem,
  listWorkspaceItems,
  toggleWorkspaceItem,
  updateWorkspaceItem,
} from '../controllers/workspaceController.js';

const router = Router();
router.use(requireAuth);
router.get('/:type', asyncHandler(listWorkspaceItems));
router.post('/:type', asyncHandler(createWorkspaceItem));
router.patch('/:type/:id', asyncHandler(updateWorkspaceItem));
router.post('/:type/:id/toggle', asyncHandler(toggleWorkspaceItem));
router.delete('/:type/:id', asyncHandler(deleteWorkspaceItem));

export default router;
