import { PrintJob } from '../models/PrintJob.js';
import { emitToUser } from '../modules/notifications/socketHandlers.js';
import { AppError } from '../utils/AppError.js';

export async function createJob(userId, shopId, payload) {
  return PrintJob.create({
    userId,
    shopId,
    ...payload,
  });
}

export async function updateJobStatus(jobId, actor, payload, app) {
  const job = await PrintJob.findById(jobId)
    .populate('userId')
    .populate('shopId');

  if (!job) throw new AppError('Job not found', 404);

  const isShop =
    actor.role === 'shop' &&
    job.shopId._id.toString() === actor._id.toString();

  if (!isShop) throw new AppError('Unauthorized', 403);

  if (payload.status === 'accepted') job.status = 'accepted';
  if (payload.status === 'printing') job.status = 'printing';

  if (payload.status === 'ready') {
    if (!payload.totalCost)
      throw new AppError('Cost required', 400);

    job.totalCost = payload.totalCost;
    job.status = 'ready';

    const io = app.get('io');
    emitToUser(io.notificationsNs, job.userId._id.toString(), {
      type: 'print_ready',
      title: 'Print Ready',
      body: `${job.fileName} is ready. Pay ₹${job.totalCost}`,
      refId: job._id,
    });
  }

  await job.save();
  return job;
}
