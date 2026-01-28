//auth controller - normal

import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';

export async function register(req, res) {
  const { email, password, name, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  const user = await User.create({ email, password, name, role: role || 'student' });
  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: { _id: user._id, email: user.email, name: user.name, role: user.role, credits: user.credits },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: { _id: user._id, email: user.email, name: user.name, role: user.role, credits: user.credits },
  });
}

export function me(req, res) {
  res.json({ success: true, user: req.user });
}
