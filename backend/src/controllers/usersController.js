//Users controller – profile, update, location

import { User } from '../models/User.js';

export function getProfile(req, res) {
  res.json({ success: true, user: req.user });
}

export async function updateProfile(req, res) {
  const { name, phone, campusId, dorm, avatar } = req.body;
  const updates = {};
  if (name != null) updates.name = name;
  if (phone != null) updates.phone = phone;
  if (campusId != null) updates.campusId = campusId;
  if (dorm != null) updates.dorm = dorm;
  if (avatar != null) updates.avatar = avatar;
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  res.json({ success: true, user });
}

export async function updateLocation(req, res) {
  const { lng, lat } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      lastKnownLocation: { type: 'Point', coordinates: [lng, lat] },
      lastLocationUpdatedAt: new Date(),
    },
    { new: true }
  ).select('-password');
  res.json({ success: true, user });
}
