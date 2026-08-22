import { env } from '../config/env.js';

export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    error: {
      message: statusCode >= 500 && env.nodeEnv === 'production' ? 'Something went wrong.' : error.message,
      code: error.code || 'INTERNAL_ERROR',
    },
  };

  if (error.details) response.error.details = error.details;
  if (env.nodeEnv !== 'production' && statusCode >= 500) response.error.stack = error.stack;

  res.status(statusCode).json(response);
}

