import { validationResult } from 'express-validator';
import { AppError } from '../utils/appError.js';

export function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Please check the highlighted fields.', 422, 'VALIDATION_ERROR', errors.array()));
  }
  next();
}

