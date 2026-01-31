//Campus Credits + Gamification - transaction log


import mongoose from 'mongoose';

const creditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true }, 
    reason: {
      type: String,
      enum: [
        'errand_complete',
        'errand_bonus',
        'carpool_ride',
        'order_contribution',
        'print_job',
        'admin_adjustment',
        'bonus',
        'streak',
        'referral',
        'other',
      ],
      default: 'other',
    },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null }, 
    refType: { type: String, default: null },
    balanceAfter: { type: Number, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

creditLogSchema.index({ userId: 1, createdAt: -1 });

export const CreditLog = mongoose.model('CreditLog', creditLogSchema);
