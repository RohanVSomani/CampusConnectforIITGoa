//credits controller - jush for show

import { User } from '../models/User.js';
import { CreditLog } from '../models/CreditLog.js';
import * as creditsEngine from '../services/creditsEngine.js';

export async function balance(req, res) {
  const b = await creditsEngine.getBalance(req.user._id);
  res.json({ success: true, ...b });
}

export async function history(req, res) {
  const list = await CreditLog.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ success: true, data: list });
}

export async function leaderboard(req, res) {
  const data = await User.find({ role: 'student' })
    .select('name credits level streak badges')
    .sort({ credits: -1 })
    .limit(20)
    .lean();
  res.json({ success: true, data });
}
