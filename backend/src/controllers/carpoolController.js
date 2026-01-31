// carpool controller - creating updating joining leaving ending
import { Carpool } from '../models/Carpool.js';

export async function list(req, res) {
  const filters = { status: req.query.status || 'open' };
  if (req.query.from) filters.from = new RegExp(req.query.from, 'i');
  if (req.query.to) filters.to = new RegExp(req.query.to, 'i');

  const data = await Carpool.find(filters)
    .populate('driverId', 'name email')
    .populate('passengers', 'name email')
    .sort({ departureAt: 1 })
    .lean();

  res.json({ success: true, data });
}

export async function create(req, res) {
  const doc = await Carpool.create({
    ...req.body,
    driverId: req.user._id,
  });

  const populated = await Carpool.findById(doc._id)
    .populate('driverId', 'name email')
    .lean();

  res.status(201).json({ success: true, data: populated });
}

export async function my(req, res) {
  const [asDriver, asPassenger] = await Promise.all([
    Carpool.find({ driverId: req.user._id }).populate('passengers', 'name email'),
    Carpool.find({ passengers: req.user._id }).populate('driverId', 'name email'),
  ]);

  res.json({ success: true, data: { asDriver, asPassenger } });
}

export async function join(req, res) {
  const carpool = await Carpool.findOne({ _id: req.params.id, status: 'open' });

  if (!carpool) return res.status(404).json({ message: 'Not found or closed' });

  if (carpool.driverId.toString() === req.user._id.toString())
    return res.status(400).json({ message: 'Driver cannot join' });

  if (carpool.passengers.includes(req.user._id))
    return res.status(400).json({ message: 'Already joined' });

  if (carpool.seatsTaken >= carpool.maxSeats)
    return res.status(400).json({ message: 'Carpool full' });

  carpool.passengers.push(req.user._id);
  carpool.seatsTaken = carpool.passengers.length;
  if (carpool.seatsTaken >= carpool.maxSeats) carpool.status = 'full';

  await carpool.save();

  const populated = await Carpool.findById(carpool._id)
    .populate('driverId', 'name email')
    .populate('passengers', 'name email');

  const io = req.app.get('io');
  if (io) {
    io.of('/carpool')
      .to(`carpool:${carpool._id}`)
      .emit('updated', populated);
  }

  res.json({ success: true, data: populated });
}

export async function leave(req, res) {
  const carpool = await Carpool.findById(req.params.id);
  if (!carpool) return res.status(404).json({ message: 'Not found' });

  carpool.passengers = carpool.passengers.filter(
    (p) => p.toString() !== req.user._id.toString()
  );

  carpool.seatsTaken = carpool.passengers.length;
  if (carpool.status === 'full') carpool.status = 'open';

  await carpool.save();

  const populated = await Carpool.findById(carpool._id)
    .populate('driverId', 'name email')
    .populate('passengers', 'name email');

  const io = req.app.get('io');
  if (io) {
    io.of('/carpool')
      .to(`carpool:${carpool._id}`)
      .emit('updated', populated);
  }

  res.json({ success: true, data: populated });
}

export async function end(req, res) {
  const carpool = await Carpool.findById(req.params.id);

  if (!carpool) {
    return res.status(404).json({ message: 'Carpool not found' });
  }

  if (carpool.driverId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only driver can end the carpool' });
  }

  if (['completed', 'cancelled'].includes(carpool.status)) {
    return res.status(400).json({ message: 'Carpool already ended' });
  }

  carpool.status = 'completed';
  await carpool.save();

  const populated = await Carpool.findById(carpool._id)
    .populate('driverId', 'name email')
    .populate('passengers', 'name email');

  const io = req.app.get('io');
  if (io) {
    io.of('/carpool')
      .to(`carpool:${carpool._id}`)
      .emit('updated', populated);
  }

  res.json({ success: true, data: populated });
}
