import { User } from '../models/User.js';
import { SOS } from '../models/SOS.js';

const CENTER = { lat: 12.9716, lng: 77.5946 };

function offset(dx, dy) {
  return {
    lat: CENTER.lat + dy,
    lng: CENTER.lng + dx,
  };
}
export async function heatmap(req, res) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const users = await User.find({
    'lastKnownLocation.coordinates.0': { $exists: true },
    lastLocationUpdatedAt: { $gte: since },
  }).select('lastKnownLocation lastLocationUpdatedAt').lean();

  const sos = await SOS.find({ status: 'active' })
    .select('location createdAt')
    .lean();

  const points = [
    ...users.map(u => ({
      coordinates: u.lastKnownLocation.coordinates,
      type: 'movement',
      updatedAt: u.lastLocationUpdatedAt,
    })),
    ...sos.map(s => ({
      coordinates: s.location.coordinates,
      type: 'sos',
      updatedAt: s.createdAt,
    })),
  ];

  res.json({ success: true, data: { points } });
}

export async function pois(req, res) {
  const fixedPOIs = [
    { id: 'main_gate', name: 'Main Gate', type: 'gate', ...offset(-0.005, 0.003) },
    { id: 'main_building', name: 'Main Building', type: 'building', ...offset(0, 0) },
    { id: 'canteen', name: 'Canteen', type: 'food', ...offset(0.005, -0.002) },
    { id: 'hostel', name: 'Hostel Block', type: 'hostel', ...offset(-0.004, -0.003) },
    { id: 'parking', name: 'Parking', type: 'parking', ...offset(0.002, -0.0005) },
    { id: 'back_gate', name: 'Back Gate', type: 'gate', ...offset(-0.0028, -0.006) },
  ];

  const shops = await User.find({ role: 'shop' })
    .select('name lastKnownLocation')
    .lean();

  const shopPOIs = shops
    .filter(s => s.lastKnownLocation?.coordinates?.length === 2)
    .map(s => ({
      id: s._id,
      name: s.name,
      type: 'xerox',
      lat: s.lastKnownLocation.coordinates[1],
      lng: s.lastKnownLocation.coordinates[0],
    }));

  res.json({ success: true, data: [...fixedPOIs, ...shopPOIs] });
}
