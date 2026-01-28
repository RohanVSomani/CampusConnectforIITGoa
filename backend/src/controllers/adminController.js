//admin controller - admin apis

import { User } from '../models/User.js';
import { Travel } from '../models/Travel.js';
import { Errand } from '../models/Errand.js';
import { Carpool } from '../models/Carpool.js';
import { SOS } from '../models/SOS.js';
import { Order } from '../models/Order.js';
import { PrintJob } from '../models/PrintJob.js';

export async function stats(req, res) {
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const [
    usersTotal,
    travelOpen,
    errandsOpen,
    carpoolsOpen,
    sosActive,
    ordersPlaced,
    printJobsToday,
  ] = await Promise.all([
    User.countDocuments(),
    Travel.countDocuments({ status: 'open' }),
    Errand.countDocuments({ status: 'open' }),
    Carpool.countDocuments({ status: 'open' }),
    SOS.countDocuments({ status: 'active' }),
    Order.countDocuments({ status: { $in: ['placed', 'preparing', 'delivered'] } }),
    PrintJob.countDocuments({
      createdAt: { $gte: startOfDay },
      status: { $nin: ['cancelled'] },
    }),
  ]);
  res.json({
    success: true,
    data: {
      usersTotal,
      travelOpen,
      errandsOpen,
      carpoolsOpen,
      sosActive,
      ordersPlaced,
      printJobsToday,
    },
  });
}

export async function users(req, res) {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const data = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ success: true, data });
}

export async function activity(req, res) {
  const [travel, errands, carpools, sos] = await Promise.all([
    Travel.find().populate('userId', 'name').sort({ createdAt: -1 }).limit(10).lean(),
    Errand.find().populate('userId', 'name').sort({ createdAt: -1 }).limit(10).lean(),
    Carpool.find().populate('driverId', 'name').sort({ createdAt: -1 }).limit(10).lean(),
    SOS.find().populate('userId', 'name').sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  res.json({
    success: true,
    data: { travel, errands, carpools, sos },
  });
}
