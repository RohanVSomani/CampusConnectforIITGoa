
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  notes: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true },
    vendor: { type: String, required: true },
    vendorLocation: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'open', 'placed', 'preparing', 'delivered', 'cancelled'],
      default: 'draft',
    },
    placedAt: { type: Date, default: null },
    deliveryLocation: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ groupId: 1 });
orderSchema.index({ status: 1, createdBy: 1 });

export const Order = mongoose.model('Order', orderSchema);
