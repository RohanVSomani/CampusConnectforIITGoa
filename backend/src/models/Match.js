

import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    travelA: { type: mongoose.Schema.Types.ObjectId, ref: 'Travel', required: true },
    travelB: { type: mongoose.Schema.Types.ObjectId, ref: 'Travel', required: true },
    score: { type: Number, required: true, min: 0, max: 1 },
  },
  { timestamps: true }
);

matchSchema.index({ travelA: 1, travelB: 1 }, { unique: true });
matchSchema.index({ createdAt: -1 });

export const Match = mongoose.model('Match', matchSchema);
