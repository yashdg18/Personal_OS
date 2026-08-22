import { AppError } from '../utils/appError.js';
import { verifyVaultToken } from '../utils/jwt.js';

export function requireVaultUnlocked(req, _res, next) {
  try {
    const token = req.get('x-vault-token');
    if (!token) throw new AppError('Unlock the vault first.', 401, 'VAULT_LOCKED');
    const payload = verifyVaultToken(token);
    if (payload.purpose !== 'vault' || payload.sub !== req.user._id.toString()) throw new AppError('Unlock the vault first.', 401, 'VAULT_LOCKED');
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return next(new AppError('Vault session expired. Unlock again.', 401, 'VAULT_LOCKED'));
    next(error);
  }
}
