import WorkspaceItem, { WORKSPACE_TYPES } from '../models/WorkspaceItem.js';
import { AppError } from '../utils/appError.js';

const allowedFields = [
  'title', 'description', 'category', 'priority', 'status', 'startDate', 'endDate', 'taskDate',
  'target', 'currentProgress', 'estimatedMinutes', 'completed', 'completedAt', 'pinned', 'data',
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

function normalizeDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function pickPayload(body = {}) {
  const payload = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) payload[field] = body[field];
  }
  for (const field of ['startDate', 'endDate', 'taskDate', 'completedAt']) {
    if (payload[field] !== undefined) payload[field] = normalizeDate(payload[field]);
  }
  if (payload.data && typeof payload.data !== 'object') payload.data = {};
  return payload;
}

function assertType(type) {
  if (!WORKSPACE_TYPES.includes(type) || type === 'secret') throw new AppError('Unsupported workspace module.', 400, 'INVALID_MODULE');
}

function serialize(item) {
  const object = typeof item.toObject === 'function' ? item.toObject() : item;
  return { ...object, id: item._id?.toString?.() || item.id };
}

export async function listWorkspaceItems(req, res) {
  const { type } = req.params;
  assertType(type);
  const filter = { userId: req.user._id, type };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.completed !== undefined) filter.completed = req.query.completed === 'true';
  if (req.query.date) {
    const start = new Date(`${req.query.date}T00:00:00.000Z`);
    const end = new Date(`${req.query.date}T23:59:59.999Z`);
    if (!Number.isNaN(start.getTime()) && type === 'task') filter.taskDate = { $gte: start, $lte: end };
  }
  if (req.query.q) {
    const query = new RegExp(escapeRegex(req.query.q.trim()), 'i');
    filter.$or = [{ title: query }, { description: query }, { category: query }];
  }

  const items = await WorkspaceItem.find(filter).sort({ pinned: -1, completed: 1, endDate: 1, createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: { items: items.map((item) => serialize(item)) } });
}

export async function createWorkspaceItem(req, res) {
  const { type } = req.params;
  assertType(type);
  if (!req.body.title?.trim()) throw new AppError('A title is required.', 400, 'TITLE_REQUIRED');
  const item = await WorkspaceItem.create({ userId: req.user._id, type, ...pickPayload(req.body) });
  res.status(201).json({ success: true, data: { item: serialize(item) } });
}

export async function updateWorkspaceItem(req, res) {
  const { type, id } = req.params;
  assertType(type);
  const item = await WorkspaceItem.findOne({ _id: id, userId: req.user._id, type });
  if (!item) throw new AppError('Item not found.', 404, 'ITEM_NOT_FOUND');
  Object.assign(item, pickPayload(req.body));
  await item.save();
  res.json({ success: true, data: { item: serialize(item) } });
}

export async function deleteWorkspaceItem(req, res) {
  const { type, id } = req.params;
  assertType(type);
  const result = await WorkspaceItem.deleteOne({ _id: id, userId: req.user._id, type });
  if (!result.deletedCount) throw new AppError('Item not found.', 404, 'ITEM_NOT_FOUND');
  res.json({ success: true, data: { id, deleted: true } });
}

export async function toggleWorkspaceItem(req, res) {
  const { type, id } = req.params;
  assertType(type);
  const item = await WorkspaceItem.findOne({ _id: id, userId: req.user._id, type });
  if (!item) throw new AppError('Item not found.', 404, 'ITEM_NOT_FOUND');
  item.completed = req.body.completed === undefined ? !item.completed : Boolean(req.body.completed);
  item.completedAt = item.completed ? new Date() : undefined;
  if (type === 'goal' && item.completed) item.status = 'completed';
  if (type === 'goal' && !item.completed && item.status === 'completed') item.status = 'active';
  await item.save();
  res.json({ success: true, data: { item: serialize(item) } });
}
