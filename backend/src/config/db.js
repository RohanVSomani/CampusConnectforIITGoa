//connnectiing to db - do it on 26th
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  mongoose.connection.on('error', (err) => console.error('[MongoDB] Connection error:', err));
  mongoose.connection.on('disconnected', () => console.warn('[MongoDB] Disconnected'));
}
