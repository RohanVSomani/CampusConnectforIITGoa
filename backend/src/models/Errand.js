

import mongoose from 'mongoose';

const errandSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['item', 'errand'], default: 'errand' },
    fromLocation: { type: String, default: '' },
    toLocation: { type: String, default: '' },
    deadline: { type: Date, default: null },
    rewardCredits: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['open', 'claimed', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

errandSchema.index({ status: 1 });
errandSchema.index({ userId: 1 });

export const Errand = mongoose.model('Errand', errandSchema);
