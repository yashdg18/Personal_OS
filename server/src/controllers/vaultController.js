import bcrypt from 'bcryptjs';
import WorkspaceItem from '../models/WorkspaceItem.js';
import { AppError } from '../utils/appError.js';
import { signVaultToken } from '../utils/jwt.js';
import { decryptText, encryptText } from '../utils/secure.js';

export async function setupVault(req, res) {
  if (req.user.vaultPasswordHash) throw new AppError('Vault password already exists.', 409, 'VAULT_ALREADY_SETUP');
  if (!req.body.password || req.body.password.length < 8) throw new AppError('Vault password must be at least 8 characters.', 400, 'INVALID_VAULT_PASSWORD');
  req.user.vaultPasswordHash = await bcrypt.hash(req.body.password, 12);
  await req.user.save({ validateBeforeSave: false });
  res.status(201).json({ success: true, data: { configured: true } });
}

export async function unlockVault(req, res) {
  const user = await req.user.constructor.findById(req.user._id).select('+vaultPasswordHash');
  if (!user?.vaultPasswordHash) throw new AppError('Set a vault password before unlocking.', 400, 'VAULT_NOT_SETUP');
  if (!(await bcrypt.compare(req.body.password || '', user.vaultPasswordHash))) throw new AppError('Vault password is incorrect.', 401, 'VAULT_PASSWORD_INVALID');
  res.json({ success: true, data: { token: signVaultToken(req.user._id.toString()), configured: true } });
}

function serialize(item) {
  const object = item.toObject();
  let content = '';
  try { content = object.data?.encrypted ? decryptText(object.data.encrypted) : ''; } catch { content = '[Unable to decrypt this secret]'; }
  return { id: object._id.toString(), title: object.title, category: object.category, pinned: object.pinned, createdAt: object.createdAt, updatedAt: object.updatedAt, content };
}

export async function listSecrets(req, res) {
  const items = await WorkspaceItem.find({ userId: req.user._id, type: 'secret' }).sort({ pinned: -1, updatedAt: -1 });
  res.json({ success: true, data: { items: items.map(serialize) } });
}

export async function createSecret(req, res) {
  if (!req.body.title?.trim() || !req.body.content?.trim()) throw new AppError('Title and secret content are required.', 400, 'SECRET_FIELDS_REQUIRED');
  const item = await WorkspaceItem.create({ userId: req.user._id, type: 'secret', title: req.body.title, category: req.body.category || 'Personal', pinned: Boolean(req.body.pinned), data: { encrypted: encryptText(req.body.content) } });
  res.status(201).json({ success: true, data: { item: serialize(item) } });
}

export async function updateSecret(req, res) {
  const item = await WorkspaceItem.findOne({ _id: req.params.id, userId: req.user._id, type: 'secret' });
  if (!item) throw new AppError('Secret not found.', 404, 'SECRET_NOT_FOUND');
  if (req.body.title !== undefined) item.title = req.body.title;
  if (req.body.category !== undefined) item.category = req.body.category;
  if (req.body.pinned !== undefined) item.pinned = Boolean(req.body.pinned);
  if (req.body.content !== undefined) item.data = { encrypted: encryptText(req.body.content) };
  await item.save();
  res.json({ success: true, data: { item: serialize(item) } });
}

export async function deleteSecret(req, res) {
  const result = await WorkspaceItem.deleteOne({ _id: req.params.id, userId: req.user._id, type: 'secret' });
  if (!result.deletedCount) throw new AppError('Secret not found.', 404, 'SECRET_NOT_FOUND');
  res.json({ success: true, data: { deleted: true } });
}
