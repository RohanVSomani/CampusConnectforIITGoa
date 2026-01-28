//code map controller - + pois like xerox , canteen etc...
import { User } from '../models/User.js';

export async function heatmap(req, res) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const users = await User.find({
    'lastKnownLocation.coordinates.0': { $exists: true },
    lastLocationUpdatedAt: { $gte: since },
  })
    .select('lastKnownLocation lastLocationUpdatedAt')
    .lean();

  const points = users
    .filter((u) => u.lastKnownLocation?.coordinates?.length >= 2)
    .map((u) => ({
      coordinates: u.lastKnownLocation.coordinates,
      updatedAt: u.lastLocationUpdatedAt,
    }));

  res.json({
    success: true,
    data: { points },
  });
}

export function pois(req, res) {
  const data = [
    { id: 'lib', name: 'Library', type: 'building', lng: 77.0, lat: 28.5 },
    { id: 'cafe', name: 'Central Cafe', type: 'food', lng: 77.01, lat: 28.51 },
    { id: 'gym', name: 'Sports Complex', type: 'building', lng: 76.99, lat: 28.49 },
  ];

  res.json({
    success: true,
    data,
  });
}
