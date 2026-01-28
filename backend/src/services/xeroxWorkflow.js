

import { User } from '../models/User.js';
import { PrintJob } from '../models/PrintJob.js';
import { AppError } from '../utils/AppError.js';
import * as creditsEngine from './creditsEngine.js';

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {import('mongoose').Types.ObjectId} shopId
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createJob(userId, shopId, payload) {
  const shop = await User.findOne({ _id: shopId, role: 'xerox_shop' });
  if (!shop) throw new AppError('Shop not found', 404);
  const creditsUsed = Math.max(0, payload.creditsUsed ?? 0);
  if (creditsUsed > 0) {
    await creditsEngine.deduct(userId, creditsUsed, 'print_job', {
      refType: 'PrintJob',
      metadata: { fileName: payload.fileName, shopId: shop._id.toString() },
    });
  }
  const doc = await PrintJob.create({
    userId,
    shopId: shop._id,
    fileUrl: payload.fileUrl,
    fileName: payload.fileName,
    copies: payload.copies ?? 1,
    sides: payload.sides ?? 'single',
    color: payload.color ?? 'bw',
    totalCost: payload.totalCost ?? 0,
    creditsUsed,
  });
  const populated = await PrintJob.findById(doc._id)
    .populate('userId', 'name email')
    .populate('shopId', 'name shopName shopLocation')
    .lean();
  return populated;
}

/**
 * @param {string} jobId
 * @param {{ _id: import('mongoose').Types.ObjectId, role: string }} actor
 * @param {{ status: string }} payload
 * @returns {Promise<object>} 
 */
export async function updateJobStatus(jobId, actor, payload) {
  const job = await PrintJob.findById(jobId)
    .populate('userId', 'name email')
    .populate('shopId', 'name shopName shopLocation');
  if (!job) throw new AppError('Print job not found', 404);
  const isStudent = job.userId._id.toString() === actor._id.toString();
  const isShop = actor.role === 'xerox_shop' && job.shopId._id.toString() === actor._id.toString();

  if (payload.status === 'cancelled' && isStudent && job.status === 'pending') {
    job.status = 'cancelled';
    if (job.creditsUsed > 0) {
      await creditsEngine.add(actor._id, job.creditsUsed, 'other', {
        refId: job._id,
        refType: 'PrintJob',
        metadata: { reason: 'print_cancelled_refund' },
      });
    }
  } else if (['accepted', 'printing', 'ready', 'collected'].includes(payload.status) && isShop) {
    job.status = payload.status;
    if (payload.status === 'collected') job.collectedAt = new Date();
  } else {
    throw new AppError('Cannot update this job', 403);
  }
  await job.save();
  return PrintJob.findById(job._id)
    .populate('userId', 'name email')
    .populate('shopId', 'name shopName shopLocation')
    .lean();
}
