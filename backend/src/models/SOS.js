

import mongoose from 'mongoose';

const sosSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: {type :[Number], required: true,}
    },
    address: { type: String, default: '' },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved', 'false_alarm'],
      default: 'active',
    },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

sosSchema.index({ status: 1 });
sosSchema.index({ location: '2dsphere' });

export const SOS = mongoose.model('SOS', sosSchema);
