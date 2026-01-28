//carpool chat
import mongoose from 'mongoose';

const carpoolChatSchema = new mongoose.Schema(
  {
    carpoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carpool', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

carpoolChatSchema.index({ carpoolId: 1, createdAt: 1 });

export const CarpoolChat = mongoose.model('CarpoolChat', carpoolChatSchema);
