
import mongoose from 'mongoose';

const printJobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    copies: { type: Number, default: 1, min: 1 },
    sides: { type: String, enum: ['single', 'double'], default: 'single' },
    color: { type: String, enum: ['bw', 'color'], default: 'bw' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'printing', 'ready', 'collected', 'cancelled'],
      default: 'pending',
    },
    totalCost: { type: Number, default: 0 },
    creditsUsed: { type: Number, default: 0 },
    collectedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

printJobSchema.index({ userId: 1, status: 1 });
printJobSchema.index({ shopId: 1, status: 1 });

export const PrintJob = mongoose.model('PrintJob', printJobSchema);
