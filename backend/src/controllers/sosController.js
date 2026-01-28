//SOS controller – create, list, update. Uses emergency tracking service.
import { SOS } from '../models/SOS.js';
import * as emergencyTracking from '../services/emergencyTracking.js';

export async function create(req, res) {
  const io = req.app.get('io');
  const data = await emergencyTracking.createSOS(
    req.user._id,
    {
      lng: req.body.lng,
      lat: req.body.lat,
      address: req.body.address,
      message: req.body.message,
    },
    { io }
  );
  res.status(201).json({ success: true, data });
}

export async function list(req, res) {
  const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
  const list = await SOS.find(filter)
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: list });
}

export async function update(req, res) {
  const io = req.app.get('io');
  const data = await emergencyTracking.updateSOS(
    req.params.id,
    req.user,
    { status: req.body.status },
    { io }
  );
  res.json({ success: true, data });
}
