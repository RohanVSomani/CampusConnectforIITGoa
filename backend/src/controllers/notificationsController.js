//Notifications controller – list, read one, read all
 

import { Notification } from '../models/Notification.js';

export async function list(req, res) {
  const list = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
  res.json({ success: true, data: list, unreadCount });
}

export async function readOne(req, res) {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true, readAt: new Date() },
    { new: true }
  ).lean();
  if (!n) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, data: n });
}

export async function readAll(req, res) {
  await Notification.updateMany(
    { userId: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );
  res.json({ success: true });
}
