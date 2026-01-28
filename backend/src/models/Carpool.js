
import mongoose from 'mongoose';

const carpoolSchema = new mongoose.Schema(
  {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    departureAt: { type: Date, required: true },
    maxSeats: { type: Number, required: true },
    seatsTaken: { type: Number, default: 0 },
    passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pricePerSeat: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'full', 'departed', 'completed', 'cancelled'],
      default: 'open',
    },
  },
  { timestamps: true }
);

carpoolSchema.index({ status: 1, departureAt: 1 });
carpoolSchema.index({ driverId: 1 });
carpoolSchema.chatRoomId = new mongoose.Types.ObjectId();

export const Carpool = mongoose.model('Carpool', carpoolSchema);
