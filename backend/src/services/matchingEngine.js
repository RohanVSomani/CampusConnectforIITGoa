

import { Travel } from '../models/Travel.js';
import { Match } from '../models/Match.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { emitToUser } from '../modules/notifications/socketHandlers.js';

const CANDIDATE_WINDOW_MS = 2 * 60 * 60 * 1000;
const TIME_DECAY_WINDOW_MS = 60 * 60 * 1000; 

const W_TIME = 0.4;
const W_LOCATION = 0.3;
const W_DESTINATION = 0.3;

/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function stringSimilarity(a, b) {
  const na = String(a ?? '').toLowerCase().trim();
  const nb = String(b ?? '').toLowerCase().trim();
  if (!na && !nb) return 1;
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const wa = [...new Set(na.split(/\s+/).filter(Boolean))];
  const wb = [...new Set(nb.split(/\s+/).filter(Boolean))];
  const setA = new Set(wa);
  let intersection = 0;
  for (const w of wb) {
    if (setA.has(w)) intersection++;
  }
  const union = wa.length + wb.length - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * @param {Date} tA
 * @param {Date} tB
 * @returns {number}
 */
function timeSimilarity(tA, tB) {
  const delta = Math.abs(new Date(tA) - new Date(tB));
  if (delta >= TIME_DECAY_WINDOW_MS) return 0;
  return Math.max(0, 1 - delta / TIME_DECAY_WINDOW_MS);
}

/**
 * @param {object} tA 
 * @param {object} tB 
 * @returns {{ score: number, timeSim: number, locationProx: number, destSim: number }}
 */
export function computeMatchScore(tA, tB) {
  const timeSim = timeSimilarity(tA.departureAt, tB.departureAt);
  const locationProx = stringSimilarity(tA.from, tB.from);
  const destSim = stringSimilarity(tA.to, tB.to);
  const score = W_TIME * timeSim + W_LOCATION * locationProx + W_DESTINATION * destSim;
  return { score, timeSim, locationProx, destSim };
}

/**
 * @param {object} travel 
 * @param {object} [opts]
 * @returns {Promise<Array<{ travel: object, score: number, timeSim: number, locationProx: number, destSim: number }>>}
 */
export async function findBestMatches(travel, opts = {}) {
  const limit = opts.limit ?? 20;
  const type = travel.type === 'request' ? 'offer' : 'request';
  const at = new Date(travel.departureAt);
  const low = new Date(at.getTime() - CANDIDATE_WINDOW_MS);
  const high = new Date(at.getTime() + CANDIDATE_WINDOW_MS);

  const candidates = await Travel.find({
    _id: { $ne: travel._id },
    status: 'open',
    type,
    departureAt: { $gte: low, $lte: high },
  })
    .populate('userId', 'name email')
    .lean();

  const scored = candidates.map((c) => {
    const { score, timeSim, locationProx, destSim } = computeMatchScore(travel, c);
    return { travel: c, score, timeSim, locationProx, destSim };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * @param {object} travel
 * @param {object} [opts] 
 */
export async function findSuggestions(travel, opts = {}) {
  const best = await findBestMatches(travel, opts);
  return best.map((b) => ({ ...b.travel, matchScore: b.score }));
}

export async function findMatches(travel, opts = {}) {
  const best = await findBestMatches(travel, { ...opts, limit: opts.limit ?? 20 });
  return best.map((b) => b.travel);
}

/**
 * @param {string} travelId
 * @param {string} otherId
 * @param {{ io?: import('socket.io').Server }} [ctx]
 * @returns {Promise<{ travel: object, other: object, match: object }>}
 */
export async function matchPair(travelId, otherId, ctx = {}) {
  const [travel, other] = await Promise.all([
    Travel.findOne({ _id: travelId, status: 'open' }).populate('userId', 'name email'),
    Travel.findOne({ _id: otherId, status: 'open' }).populate('userId', 'name email'),
  ]);
  if (!travel) throw new AppError('Travel not found or not open', 404);
  if (!other) throw new AppError('Other travel not found or not open', 404);
  if (travel.type === other.type) throw new AppError('Must match request with offer', 400);

  const { score } = computeMatchScore(travel, other);

  travel.matchedWith = other._id;
  travel.status = 'matched';
  other.matchedWith = travel._id;
  other.status = 'matched';
  await Promise.all([travel.save(), other.save()]);

  const matchDoc = await Match.create({
    travelA: travel._id,
    travelB: other._id,
    score,
  });

  const matchPayload = {
    _id: matchDoc._id,
    travelA: travel._id,
    travelB: other._id,
    score,
    createdAt: matchDoc.createdAt,
  };

  const userIdA = travel.userId?._id ?? travel.userId;
  const userIdB = other.userId?._id ?? other.userId;
  const nameA = travel.userId?.name ?? 'Someone';
  const nameB = other.userId?.name ?? 'Someone';

  await Notification.insertMany([
    {
      userId: userIdA,
      title: 'Travel match',
      body: `Matched with ${nameB} (${other.from} → ${other.to}). Score: ${(score * 100).toFixed(0)}%`,
      type: 'travel_match',
      refId: matchDoc._id,
      refType: 'Match',
    },
    {
      userId: userIdB,
      title: 'Travel match',
      body: `Matched with ${nameA} (${travel.from} → ${travel.to}). Score: ${(score * 100).toFixed(0)}%`,
      type: 'travel_match',
      refId: matchDoc._id,
      refType: 'Match',
    },
  ]);

  const io = ctx.io;
  const notificationsNs = io?.notificationsNs;
  console.log("🔥 MATCH OCCURRED");
console.log("🔥 EMITTING TO:", userIdA.toString(), userIdB.toString());
console.log("🔥 notificationsNs exists:", !!notificationsNs);

  if (notificationsNs) {
    emitToUser(notificationsNs, userIdA.toString(), {
      type: 'travel_match',
      title: 'Travel match',
      body: `Matched with ${nameB} (${other.from} → ${other.to}). Score: ${(score * 100).toFixed(0)}%`,
      refId: matchDoc._id,
      refType: 'Match',
      match: matchPayload,
    });
    emitToUser(notificationsNs, userIdB.toString(), {
      type: 'travel_match',
      title: 'Travel match',
      body: `Matched with ${nameA} (${travel.from} → ${travel.to}). Score: ${(score * 100).toFixed(0)}%`,
      refId: matchDoc._id,
      refType: 'Match',
      match: matchPayload,
    });
  }

  const tPlain = travel.toObject ? travel.toObject() : travel;
  const oPlain = other.toObject ? other.toObject() : other;
  return {
    travel: tPlain,
    other: oPlain,
    match: { ...matchPayload, score },
  };
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {object} [opts] 
 */
export async function listMyMatches(userId, opts = {}) {
  const limit = opts.limit ?? 50;
  const myTravelIds = await Travel.find({ userId }).distinct('_id');
  const matches = await Match.find({
    $or: [
      { travelA: { $in: myTravelIds } },
      { travelB: { $in: myTravelIds } },
    ],
  })
    .populate({
      path: 'travelA',
      select: 'from to departureAt type userId',
      populate: { path: 'userId', select: 'name email' },
    })
    .populate({
      path: 'travelB',
      select: 'from to departureAt type userId',
      populate: { path: 'userId', select: 'name email' },
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return matches;
}
