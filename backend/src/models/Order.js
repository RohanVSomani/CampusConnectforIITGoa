import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  notes: { type: String, default: '' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const orderSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, unique: true },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    vendor: { type: String, required: true },
    vendorLocation: { type: String, default: '' },
    deliveryLocation: { type: String, default: '' },

    items: [orderItemSchema],

    totalAmount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['open', 'placed', 'preparing', 'delivered', 'cancelled'],
      default: 'open',
    },

    placedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ groupId: 1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model('Order', orderSchema);
