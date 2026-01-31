import { SOS } from '../models/SOS.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export async function createSOS(userId, payload, ctx = {}) {
  const { lng, lat, message, address } = payload;

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new AppError('Invalid coordinates', 400);
  }

  const doc = await SOS.create({
    userId,
    location: { type: 'Point', coordinates: [lng, lat] },
    address: address || '',
    message: message || '',
  });

  await User.findByIdAndUpdate(userId, {
    lastKnownLocation: { type: 'Point', coordinates: [lng, lat] },
    lastLocationUpdatedAt: new Date(),
  });

  ctx.io?.of('/location')?.emit('sos:new', doc);

  return doc;
}

export async function updateSOS(sosId, actor, payload, ctx = {}) {
  const sos = await SOS.findById(sosId);
  if (!sos) throw new AppError('SOS not found', 404);

  const isAdmin = actor.role === 'admin';
  const isOwner = sos.userId.toString() === actor._id.toString();

  if (!isAdmin && !isOwner) throw new AppError('Forbidden', 403);

  sos.status = payload.status;
  if (payload.status === 'resolved') sos.resolvedAt = new Date();

  await sos.save();

  const populated = await SOS.findById(sos._id)
    .populate('userId', 'name email phone')
    .lean();

  ctx.io?.of('/location')?.emit('sos:updated', populated);

  return populated;
}
