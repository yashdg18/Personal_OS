import mongoose from 'mongoose';

export const WORKSPACE_TYPES = [
  'goal',
  'task',
  'plan',
  'careerGoal',
  'careerProject',
  'application',
  'exam',
  'skill',
  'futureSkill',
  'book',
  'note',
  'gallery',
  'document',
  'focus',
  'reminder',
  'secret',
];

const workspaceItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: WORKSPACE_TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 3000 },
    category: { type: String, trim: true, maxlength: 80, default: 'Personal' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, trim: true, maxlength: 40, default: 'planned' },
    startDate: Date,
    endDate: Date,
    taskDate: Date,
    target: { type: Number, min: 0, default: 100 },
    currentProgress: { type: Number, min: 0, default: 0 },
    estimatedMinutes: { type: Number, min: 0, max: 1440, default: 30 },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    pinned: { type: Boolean, default: false },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);

workspaceItemSchema.index({ userId: 1, type: 1, createdAt: -1 });
workspaceItemSchema.index({ userId: 1, type: 1, endDate: 1 });
workspaceItemSchema.index({ userId: 1, type: 1, completed: 1 });

export default mongoose.model('WorkspaceItem', workspaceItemSchema);
