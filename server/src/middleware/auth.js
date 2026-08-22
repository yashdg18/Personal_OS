import User from '../models/User.js';
import { ACCESS_COOKIE, verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';

export async function requireAuth(req, _res, next) {
  try {
    const token = req.cookies?.[ACCESS_COOKIE];
    if (!token) {
      throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Authentication required.', 401, 'AUTH_REQUIRED'));
    }
    next(error);
  }
}

