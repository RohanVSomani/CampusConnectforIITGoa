import mongoose from 'mongoose';

const printJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  file: {
    data: Buffer,
    contentType: String,
  },
  fileName: { type: String, required: true },

  copies: { type: Number, default: 1 },
  sides: { type: String, enum: ['single', 'double'], default: 'single' },
  color: { type: String, enum: ['bw', 'color'], default: 'bw' },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'printing', 'ready', 'collected'],
    default: 'pending',
  },

  totalCost: { type: Number, default: 0 },
  collectedAt: { type: Date, default: null },
}, { timestamps: true });

export const PrintJob = mongoose.model('PrintJob', printJobSchema);
