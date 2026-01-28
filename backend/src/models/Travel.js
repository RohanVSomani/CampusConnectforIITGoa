

import mongoose from 'mongoose';

const travelSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['request', 'offer'], required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    departureAt: { type: Date, required: true },
    seats: { type: Number, default: 1 },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'matched', 'completed', 'cancelled'],
      default: 'open',
    },
    matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'Travel', default: null },
  },
  { timestamps: true }
);

travelSchema.index({ status: 1, departureAt: 1 });
travelSchema.index({ userId: 1 });

export const Travel = mongoose.model('Travel', travelSchema);
