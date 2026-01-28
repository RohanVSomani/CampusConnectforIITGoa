

import { SOS } from '../models/SOS.js';
import { User } from '../models/User.js';   // 🔥 ADD THIS
import { AppError } from '../utils/AppError.js';

/**

 * @param {import('mongoose').Types.ObjectId} userId
 * @param {{ lng: number, lat: number, address?: string, message?: string }} payload
 * @param {{ io?: import('socket.io').Server }} [ctx]
 * @returns {Promise<object>}
 */
export async function createSOS(userId, payload, ctx = {}) {


  if (typeof payload.lat !== 'number' || typeof payload.lng !== 'number') {
    throw new AppError('Invalid coordinates', 400);
  }

  const doc = await SOS.create({
    userId,
    location: { type: 'Point', coordinates: [payload.lng, payload.lat] },
    address: payload.address ?? '',
    message: payload.message ?? '',
  });

  await User.findByIdAndUpdate(userId, {
    lastKnownLocation: {
      type: 'Point',
      coordinates: [payload.lng, payload.lat],
    },
    lastLocationUpdatedAt: new Date(),
  });

  const out = doc.toObject ? doc.toObject() : doc;

  const io = ctx.io;
  const locationNs = io?.of?.('/location');
  if (locationNs) {
    locationNs.emit('sos:new', {
      _id: doc._id,
      userId: doc.userId,
      location: doc.location,
      address: doc.address,
      message: doc.message,
      createdAt: doc.createdAt,
    });
  }

  return out;
}

/**

 * @param {string} sosId
 * @param {{ _id: import('mongoose').Types.ObjectId, role: string }} actor
 * @param {{ status: string }} payload
 * @param {{ io?: import('socket.io').Server }} [ctx]
 * @returns {Promise<object>} 
 */
export async function updateSOS(sosId, actor, payload, ctx = {}) {
  const sos = await SOS.findById(sosId);
  if (!sos) throw new AppError('SOS not found', 404);

  const isAdmin = actor.role === 'admin';
  const isOwner = sos.userId.toString() === actor._id.toString();
  if (!isAdmin && !isOwner) throw new AppError('Forbidden', 403);

  if (payload.status === 'acknowledged' && !sos.acknowledgedBy) {
    sos.status = 'acknowledged';
    sos.acknowledgedBy = actor._id;
  } else if (['resolved', 'false_alarm'].includes(payload.status)) {
    sos.status = payload.status;
    sos.resolvedAt = new Date();
  }

  await sos.save();

  const populated = await SOS.findById(sos._id)
    .populate('userId', 'name email phone')
    .lean();

  const io = ctx.io;
  const locationNs = io?.of?.('/location');
  if (locationNs) locationNs.emit('sos:updated', populated);

  return populated;
}
