import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPassword,
} from '../controllers/authController.js';

const router = Router();
const email = body('email').isEmail().withMessage('Enter a valid email.').normalizeEmail();
const password = body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8 to 128 characters.');

router.post(
  '/register',
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2 to 80 characters.'),
  email,
  password,
  validateRequest,
  asyncHandler(register),
);
router.post('/login', email, body('password').isString().notEmpty().withMessage('Password is required.'), validateRequest, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));
router.patch(
  '/password',
  requireAuth,
  body('currentPassword').isString().notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 8, max: 128 }).withMessage('New password must be 8 to 128 characters.'),
  validateRequest,
  asyncHandler(changePassword),
);
router.post('/forgot-password', email, validateRequest, asyncHandler(forgotPassword));
router.post('/reset-password', body('token').isLength({ min: 32 }).withMessage('Reset token is required.'), password, validateRequest, asyncHandler(resetPassword));

export default router;

