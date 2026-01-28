
import { User } from '../models/User.js';
import { CreditLog } from '../models/CreditLog.js';
import { AppError } from '../utils/AppError.js';

const REASONS = [
  'errand_complete',
  'errand_bonus', 
  'carpool_ride',
  'order_contribution',
  'print_job',
  'admin_adjustment',
  'bonus',
  'streak',
  'referral',
  'other',
];

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @returns {Promise<{ credits: number, level: number, streak: number, badges: string[] }>}
 */
export async function getBalance(userId) {
  const user = await User.findById(userId).select('credits level streak badges').lean();
  if (!user) return { credits: 0, level: 1, streak: 0, badges: [] };
  return {
    credits: user.credits ?? 0,
    level: user.level ?? 1,
    streak: user.streak ?? 0,
    badges: user.badges ?? [],
  };
}

/**
 
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {number} amount
 * @param {string} reason 
 * @param {object} [opts]
 * @returns {Promise<{ balanceAfter: number }>}
 */
export async function add(userId, amount, reason, opts = {}) {
  if (amount <= 0) throw new AppError('Amount must be positive', 400);
  if (!REASONS.includes(reason)) reason = 'other';
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  const prev = user.credits ?? 0;
  user.credits = prev + amount;
  await user.save();
  const balanceAfter = user.credits;
  await CreditLog.create({
    userId,
    amount: +amount,
    reason,
    refId: opts.refId ?? null,
    refType: opts.refType ?? null,
    balanceAfter,
    metadata: opts.metadata ?? {},
  });
  return { balanceAfter };
}

/**

 * @param {import('mongoose').Types.ObjectId} userId
 * @param {number} amount
 * @param {string} reason
 * @param {object} [opts]
 * @returns {Promise<{ balanceAfter: number }>}
 */
export async function deduct(userId, amount, reason, opts = {}) {
  if (amount <= 0) throw new AppError('Amount must be positive', 400);
  if (!REASONS.includes(reason)) reason = 'other';
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  const prev = user.credits ?? 0;
  console.log("here here")
  if (prev < amount) throw new AppError('Insufficient credits', 400);
  user.credits = prev - amount;
  await user.save();
  const balanceAfter = user.credits;
  await CreditLog.create({
    userId,
    amount: -amount,
    reason,
    refId: opts.refId ?? null,
    refType: opts.refType ?? null,
    balanceAfter,
    metadata: opts.metadata ?? {},
  });
  return { balanceAfter };
}
