import mongoose from 'mongoose';

const dailyTaskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000 },
    taskDate: { type: Date, required: true, index: true },
    category: { type: String, trim: true, maxlength: 60, default: 'Personal' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    estimatedMinutes: { type: Number, min: 0, max: 1440, default: 30 },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

dailyTaskSchema.index({ userId: 1, taskDate: 1, completed: 1 });
dailyTaskSchema.index({ userId: 1, taskDate: 1, priority: 1 });

export default mongoose.model('DailyTask', dailyTaskSchema);

