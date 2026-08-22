import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000 },
    category: { type: String, trim: true, maxlength: 60, default: 'Personal' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    startDate: Date,
    endDate: Date,
    target: { type: Number, min: 0, default: 100 },
    currentProgress: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ['planned', 'active', 'completed', 'paused', 'cancelled'], default: 'planned' },
    recurrence: { type: String, trim: true, maxlength: 60 },
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, endDate: 1 });

export default mongoose.model('Goal', goalSchema);

