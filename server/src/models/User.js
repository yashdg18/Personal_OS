import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    profile: {
      age: { type: Number, min: 0, max: 150 },
      dateOfBirth: Date,
      education: String,
      degree: String,
      graduationYear: Number,
      careerGoal: String,
      currentRole: String,
      about: String,
      profilePhoto: String,
    },
    timezone: { type: String, default: 'Asia/Kolkata' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    vaultPasswordHash: { type: String, select: false },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    profile: this.profile,
    timezone: this.timezone,
    role: this.role,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
