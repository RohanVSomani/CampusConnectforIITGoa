//Travel controller – list, create, my, suggest, match, update

import { Travel } from '../models/Travel.js';
import * as matchingEngine from '../services/matchingEngine.js';

export async function list(req, res) {
  const filters = { status: req.query.status || 'open' };
  if (req.query.type) filters.type = req.query.type;
  if (req.query.from) filters.from = new RegExp(req.query.from, 'i');
  if (req.query.to) filters.to = new RegExp(req.query.to, 'i');
  const list = await Travel.find(filters)
    .populate('userId', 'name email')
    .sort({ departureAt: 1 })
    .lean();
  res.json({ success: true, data: list });
}

export async function create(req, res) {
  const doc = await Travel.create({
    ...req.body,
    userId: req.user._id,
    seats: req.body.seats || 1,
  });
  const populated = await Travel.findById(doc._id).populate('userId', 'name email').lean();
const matches = await matchingEngine.findBestMatches(populated, { limit: 1 });

if (matches.length && matches[0].score > 0.75) {
  await matchingEngine.matchPair(populated._id, matches[0].travel._id, {
    io: req.app.get('io'),
  });
}
  res.status(201).json({ success: true, data: populated });
}

export async function my(req, res) {
  const list = await Travel.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: list });
}
export async function suggest(req, res) {
  const travel = await Travel.findById(req.query.travelId).lean();
  if (!travel) return res.status(404).json({ success: false, message: 'Travel not found' });
  const data = await matchingEngine.findBestMatches(travel, { limit: 10 });
  res.json({ success: true, data });
}

export async function myMatches(req, res) {
  const data = await matchingEngine.listMyMatches(req.user._id, { limit: 50 });
  res.json({ success: true, data });
}

export async function match(req, res) {
  const { id } = req.params;
  const { matchedTravelId } = req.body;
  if (!matchedTravelId) {
    return res.status(400).json({ success: false, message: 'matchedTravelId required' });
  }
  const io = req.app.get('io');
  const result = await matchingEngine.matchPair(id, matchedTravelId, { io });
  res.json({ success: true, data: result });
}

export async function update(req, res) {
  const travel = await Travel.findOne({ _id: req.params.id, userId: req.user._id });
  if (!travel) return res.status(404).json({ success: false, message: 'Travel not found' });
  if (req.body.status) travel.status = req.body.status;
  await travel.save();
  res.json({ success: true, data: travel });
}
