

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    type: {
      type: String,
      enum: [
        'travel_match',
        'errand_claimed',
        'carpool_join',
        'sos_alert',
        'order_update',
        'print_ready',
        'credits',
        'general',
      ],
      default: 'general',
    },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },
    refType: { type: String, default: null },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
