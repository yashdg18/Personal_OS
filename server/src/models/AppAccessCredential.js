import mongoose from 'mongoose';

const appAccessCredentialSchema = new mongoose.Schema(
  {
    credentialId: { type: String, required: true, unique: true, index: true },
    publicKey: { type: Buffer, required: true },
    counter: { type: Number, required: true, default: 0 },
    transports: [{ type: String }],
    label: { type: String, trim: true, maxlength: 80, default: 'This device' },
    lastUsedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model('AppAccessCredential', appAccessCredentialSchema);
