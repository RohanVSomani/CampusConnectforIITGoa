import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';

export async function register(req, res) {
  console.log('🔥 REGISTER HIT');
  console.log('BODY:', req.body);

  const { email, password, name, role, lat, lng } = req.body;

  if (!email || !password || !name) {
    throw new AppError('Missing required fields', 400);
  }

  const exists = await User.findOne({ email });
  if (exists) {
    throw new AppError('Email already registered', 400);
  }

  const payload = { email, password, name };

  if (role) payload.role = role;
  payload.credits = 50;
  if (typeof lat === 'number' && typeof lng === 'number') {
    payload.lastKnownLocation = {
      type: 'Point',
      coordinates: [lng, lat],
    };
    payload.lastLocationUpdatedAt = new Date();
  }

  const user = await User.create(payload);

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      credits: user.credits,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email & password required', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      credits: user.credits,
    },
  });
}

export function me(req, res) {
  res.json({
    success: true,
    user: req.user,
  });
}
