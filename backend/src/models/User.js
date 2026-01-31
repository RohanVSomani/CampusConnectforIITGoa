import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ['student', 'admin', 'shop'],
      default: 'student',
    },

    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    campusId: { type: String, default: null },
    dorm: { type: String, default: null },

    credits: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },

    lastActiveDate: { type: Date, default: null },
    badges: [{ type: String }],

    lastKnownLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },

    lastLocationUpdatedAt: { type: Date, default: null },

    shopName: { type: String, default: null },
    shopLocation: { type: String, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index(
  { lastKnownLocation: '2dsphere' },
  { partialFilterExpression: { 'lastKnownLocation.coordinates': { $type: 'array' } } }
);

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password compare
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
